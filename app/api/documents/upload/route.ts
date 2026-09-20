// POST /api/documents/upload — upload PDF, BẮT BUỘC đã unlock (cookie).
// FormData: file (PDF <=10MB) + title* + grade + type + tags[].
// Trả 201 { id, fileUrl, fileSize } để FE chuyển sang detail hoặc reload list.
import { NextResponse, type NextRequest } from "next/server";
import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { isUnauthorizedError, requireAuth } from "@/lib/auth";
import { clientIp, rateLimit, sweepRateLimit } from "@/lib/rate-limit";
import { EXAM_OPTIONS, GRADE_OPTIONS, VIDEO_TAG } from "@/lib/list-documents";

const ALLOWED_TAGS = new Set(
  [...GRADE_OPTIONS, ...EXAM_OPTIONS].map((o) => o.tag).filter((t) => t !== VIDEO_TAG)
);

function configCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) throw new Error("Thiếu CLOUDINARY_* trong .env.local");
  cloudinary.config({ cloud_name, api_key, api_secret });
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// Bỏ dấu tiếng Việt + ký tự lạ để làm public_id an toàn.
function slugify(s: string): string {
  return (s || "tai-lieu")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "tai-lieu";
}

// Context Cloudinary dạng string "custom.k=v|custom.k2=v2": strip |, =, newline để khỏi phá format.
function cleanCtx(s: string, max: number): string {
  return (s ?? "").replace(/[|=]/g, " ").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function sameHostOnly(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // form thường / curl không có origin -> cho qua (SameSite đã bảo vệ)
  try {
    const host = req.headers.get("host") ?? "";
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  sweepRateLimit();
  try {
    requireAuth(); // <-- gate cookie ở đây
  } catch (e) {
    if (isUnauthorizedError(e)) return bad("Chưa mở khóa. Hãy nhập mã truy cập.", 401);
    throw e;
  }
  if (!sameHostOnly(req)) return bad("Origin không hợp lệ.", 403);

  const ip = clientIp(req.headers);
  const rl = rateLimit(`upload:${ip}`, 10, 10 * 60_000); // 10 file/10 phút/IP
  if (!rl.ok) return bad(`Upload quá nhiều. Thử lại sau ${rl.retryAfterSec}s.`, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Body phải là FormData chứa file.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return bad("Thiếu file PDF (field 'file').");

  const maxMb = Number(process.env.MAX_UPLOAD_MB || "10");
  const maxBytes = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 10) * 1024 * 1024;
  if (file.size <= 0) return bad("File rỗng.");
  if (file.size > maxBytes) return bad(`File vượt quá ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);

  const name = file.name || "tai-lieu.pdf";
  if (!/\.pdf$/i.test(name)) return bad("Chỉ cho phép file .pdf.");
  if (file.type && file.type !== "application/pdf") return bad("Chỉ cho phép PDF (application/pdf).");

  const buf = Buffer.from(await file.arrayBuffer());
  // Magic bytes PDF: %PDF- (chống đổi đuôi png/jpg thành .pdf)
  if (buf.length < 5 || buf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return bad("File không phải PDF thật (thiếu chữ ký %PDF).");
  }

  const str = (k: string) => cleanCtx(String(form.get(k) ?? ""), 200);
  const title = str("title");
  if (!title) return bad("Thiếu tiêu đề (field 'title').");
  const grade = str("grade") || "Tất cả";
  const type = str("type") || "Tài liệu";

  // Tags: chỉ nhận tag đã định nghĩa (lop-6.., de-thi...), bỏ VIDEO_TAG.
  const rawTags = form.getAll("tags").flatMap((t) => String(t).split(","));
  const tags = Array.from(new Set(rawTags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
  for (const t of tags) if (!ALLOWED_TAGS.has(t)) return bad(`Tag không hợp lệ: ${t}.`);
  // grade/type dạng label cũng map về tag nếu khớp để list lọc được
  const gradeHit = GRADE_OPTIONS.find((o) => o.label === grade || o.tag === grade)?.tag;
  const typeHit = EXAM_OPTIONS.find((o) => o.label === type || o.tag === type)?.tag;
  for (const t of [gradeHit, typeHit]) if (t && t !== VIDEO_TAG && !tags.includes(t)) tags.push(t);

  configCloudinary();
  const folder = (process.env.UPLOAD_FOLDER || "docs").replace(/^\/+|\/+$/g, "") || "docs";
  const publicId = `${slugify(title)}-${Date.now().toString(36)}`;

  let uploaded: { public_id: string; secure_url: string; bytes: number };
  try {
    uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // PDF lưu dạng image: console preview được, Admin API trả pages, khớp file cũ
          folder,
          public_id: publicId,
          format: "pdf",
          use_filename: false,
          unique_filename: false,
          overwrite: false,
          access_mode: "public",
          tags,
          // KHÔNG thêm tiền tố "custom." ở đây: Cloudinary tự gom key lạ vào
          // context.custom (gửi "custom.title=" sẽ thành custom.custom.title, web không đọc được).
          context: [
            `title=${cleanCtx(title, 200)}`,
            `grade=${cleanCtx(grade, 100)}`,
            `type=${cleanCtx(type, 100)}`,
            `uploader=Giao vien`,
          ].join("|"),
        },
        (err, res) => (err ? reject(err) : resolve(res as never))
      );
      stream.end(buf);
    });
  } catch (e) {
    console.error("[upload] cloudinary lỗi:", e instanceof Error ? e.message : e);
    return bad("Upload lên Cloudinary thất bại. Thử lại sau.", 502);
  }

  return NextResponse.json(
    {
      id: encodeURIComponent(uploaded.public_id),
      fileUrl: uploaded.secure_url,
      bytes: uploaded.bytes,
    },
    { status: 201 }
  );
}
