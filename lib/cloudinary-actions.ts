// Server Actions Cloudinary: mọi hàm ở đây chạy TRÊN SERVER.
// "use client" import và gọi như hàm thường, Next tự biến thành request ngầm.
// API_SECRET không bao giờ lọt ra browser.
"use server";

import "server-only"; // build lỗi ngay nếu file này bị import nhầm phía client bundle
import { v2 as cloudinary } from "cloudinary";
import type { ListDocument } from "./list-documents";

// Đọc key từ .env.local (bạn tự điền). Thiếu key -> throw để FE fallback JSON local.
function config() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Thiếu CLOUDINARY_* trong .env.local");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloud_name;
}

// Kiểu thô của 1 resource trả về từ Admin API.
type RawResource = {
  public_id: string;
  resource_type: "image" | "raw" | string;
  format: string;
  version: number;
  bytes?: number;
  pages?: number; // PDF lưu dạng image thường có số trang
  created_at?: string;
  tags?: string[];
  context?: { custom?: Record<string, string> };
};

// Encode public_id để ghép URL: giữ dấu "/", encode từng segment
// ("Sử_dụng/..." -> "S%E1%BB%AD_d%E1%BB%A5ng/...", fetch/pdf.js không lỗi unicode).
function encodePublicId(publicId: string): string {
  return publicId.split("/").map((s) => encodeURIComponent(s)).join("/");
}

// Map resource thô -> DTO sạch trả cho FE (chỉ giữ field cần hiển thị).
function toDTO(r: RawResource, cloudName: string): ListDocument {
  const custom = r.context?.custom ?? {};
  const fileName = r.public_id.split("/").pop() ?? r.public_id;
  // Link xem phải đúng resource_type nơi file đang lưu (image hay raw).
  const fileUrl = `https://res.cloudinary.com/${cloudName}/${r.resource_type}/upload/v${r.version}/${encodePublicId(r.public_id)}.${r.format}`;
  // Ảnh preview trang đầu: chỉ PDF lưu dạng image mới transform được
  // (pg_1 + resize + jpg, CDN tự render lần đầu rồi cache). PDF raw cũ -> null.
  const thumbUrl =
    r.resource_type === "image" && r.format === "pdf"
      ? `https://res.cloudinary.com/${cloudName}/image/upload/pg_1,w_600,f_jpg,q_auto/v${r.version}/${encodePublicId(r.public_id)}.jpg`
      : null;
  // Ưu tiên r.pages (Admin API với pages:true), fallback context.custom.pages.
  // PDF dạng raw cũ không trả pages -> về 0 + warn để dễ debug.
  const pages = r.pages ?? (custom.pages ? Number(custom.pages) : 0);
  const pageCount = Number.isNaN(pages) ? 0 : pages;
  if (!pageCount) {
    console.warn(`[cloudinary] thiếu pages cho "${r.public_id}" (${r.resource_type}/${r.format}) — kiểm tra pages:true hoặc context.custom.pages`);
  }
  return {
    id: encodeURIComponent(r.public_id),
    title: custom.title ?? fileName.replace(/[-_]/g, " "),
    subject: custom.subject ?? "Chưa phân loại",
    grade: custom.grade ?? "Tất cả",
    type: custom.type ?? "Tài liệu",
    description: custom.description ?? "",
    fullDescription: custom.description ?? "",
    fileUrl,
    thumbUrl,
    fileSize: formatBytes(r.bytes ?? 0),
    pageCount,
    uploadedAt: formatDate(r.created_at ?? ""),
    uploadedBy: custom.uploader ?? "Giáo viên",
    tags: r.tags ?? [],
  };
}

// 2450000 -> "2.3 MB" (cho đẹp như dữ liệu mẫu).
function formatBytes(bytes: number): string {
  if (!bytes) return "--";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// "2026-09-10T..." -> "10/09/2026" (khớp mẫu StudyShelf).
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Liệt kê TẤT CẢ tag đang có trên cloud (để so khớp không phân biệt hoa/thường).
async function listAllTags(): Promise<string[]> {
  const out: string[] = [];
  let nextCursor: string | undefined = undefined;
  do {
    const res = (await cloudinary.api.tags({
      max_results: 500,
      next_cursor: nextCursor,
    })) as { tags: string[]; next_cursor?: string };
    out.push(...(res.tags ?? []));
    nextCursor = res.next_cursor;
  } while (nextCursor);
  return out;
}

// Đổi tag user chọn về đúng cách viết hoa/thường đang lưu trên Cloudinary
// ("LOP-6" vẫn khớp "lop-6"). Tag nào không tồn tại -> null (sẽ cho tập rỗng + log).
async function resolveTags(wanted: string[]): Promise<(string | null)[]> {
  if (wanted.length === 0) return [];
  const existing = await listAllTags();
  const lowerMap = new Map(existing.map((t) => [t.toLowerCase(), t]));
  return wanted.map((w) => {
    const hit = lowerMap.get(w.toLowerCase()) ?? null;
    if (!hit) console.warn(`[cloudinary] tag "${w}" không tồn tại trên cloud (tags hiện có: ${existing.join(", ") || "rỗng"})`);
    return hit;
  });
}

// Lấy resource theo NHIỀU tag (AND): mỗi tag gọi resources_by_tag riêng,
// rồi giao nhau theo public_id. Không tin vào mảng tags trong response
// (API list có khi trả rỗng) nên intersect là nguồn đúng duy nhất.
// Không tag nào -> đường all (để caller tự lọc PDF).
async function fetchByTags(tags: string[]): Promise<RawResource[]> {
  if (tags.length === 0) return fetchAll(undefined);
  const resolved = await resolveTags(tags);
  // Tag nào không tồn tại -> kết quả rỗng ngay, khỏi gọi API thừa.
  if (resolved.includes(null)) {
    const counts = resolved.map((r, i) => `${tags[i]}: ${r ? "có" : "KHÔNG TỒN TẠI"}`);
    console.warn(`[cloudinary] lọc AND dừng sớm — ${counts.join(", ")}`);
    return [];
  }
  // Gọi song song từng tag (mỗi tag lặp image+raw + next_cursor bên trong fetchAll).
  const perTag = await Promise.all((resolved as string[]).map((t) => fetchAll(t)));
  perTag.forEach((list, i) =>
    console.log(`[cloudinary] tag "${(resolved as string[])[i]}": ${list.length} file`)
  );
  // Giao nhau: giữ resource xuất hiện trong KẾT QUẢ CỦA MỌI tag.
  const [first, ...rest] = perTag;
  const restIds = rest.map((list) => new Set(list.map((r) => r.public_id)));
  return first.filter((r) => restIds.every((ids) => ids.has(r.public_id)));
}

// Lấy resource theo 1 tag (hoặc all khi không tag).
// PDF có thể nằm ở type image hoặc raw nên gọi cả 2, lặp next_cursor để lấy hết.
async function fetchAll(tag?: string): Promise<RawResource[]> {
  const out: RawResource[] = [];
  for (const resourceType of ["image", "raw"]) {
    let nextCursor: string | undefined = undefined;
    do {
      const base = {
        resource_type: resourceType,
        max_results: 500,
        context: true, // kèm context.custom (title, subject...) bạn gắn khi upload
        pages: true, // bắt buộc để Admin API trả về số trang PDF (mặc định không trả)
        next_cursor: nextCursor,
      };
      const res = (
        tag
          ? await cloudinary.api.resources_by_tag(tag, base)
          : await cloudinary.api.resources(base)
      ) as { resources: RawResource[]; next_cursor?: string };
      out.push(...(res.resources ?? []));
      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
  return out;
}

// HÀM 1: Đếm số tài liệu. Truyền mảng tag để đếm theo AND, không thì đếm all (chỉ PDF).
// FE: const n = await countDocuments() hoặc countDocuments(["lop-6"])
export async function countDocuments(tags: string[] = []): Promise<number> {
  config();
  const wanted = tags.filter(Boolean);
  const all = await fetchByTags(wanted);
  return wanted.length ? all.length : all.filter((r) => r.format === "pdf").length;
}

// HÀM 2: Liệt kê tài liệu (lọc sẵn theo từ khóa/môn/lớp/loại + mảng tag).
// tags: mỗi dropdown 1 tag, AND bằng intersect public_id phía server (không dùng mảng tags trong response).
// Không truyền tag nào thì đường all nhưng CHỈ lấy PDF (bỏ ảnh lung tung trong cloud).
// FE gọi mỗi khi đổi dropdown, ô search thì lọc tiếp client-side.
export async function listDocuments(opts?: {
  q?: string;
  subject?: string;
  grade?: string;
  type?: string;
  tags?: string[];
}): Promise<{ docs: ListDocument[]; total: number }> {
  const cloudName = config();
  const tags = (opts?.tags ?? []).filter(Boolean); // bỏ tag rỗng ("Tất cả")
  const q = (opts?.q ?? "").trim().toLowerCase();

  // Lọc AND tag bằng intersect API, còn q/subject/grade/type lọc trên DTO.
  const docs = fetchByTags(tags)
    .then((all) =>
      (tags.length ? all : all.filter((r) => r.format === "pdf")).map((r) => toDTO(r, cloudName))
    )
    .then((all) =>
      all.filter(
        (d) =>
          (!q || [d.title, d.subject, d.description, ...d.tags].join(" ").toLowerCase().includes(q)) &&
          (!opts?.subject || d.subject === opts.subject) &&
          (!opts?.grade || d.grade === opts.grade) &&
          (!opts?.type || d.type === opts.type)
      )
    );

  const result = await docs;
  return { docs: result, total: result.length };
}

// HÀM 3: Chi tiết 1 tài liệu theo public_id (id trên URL đã encode).
// Thử type image trước rồi raw, không thấy -> trả null để FE hiện màn not-found.
export async function getCloudDocument(id: string): Promise<ListDocument | null> {
  const cloudName = config();
  const publicId = decodeURIComponent(id);
  for (const resourceType of ["image", "raw"]) {
    try {
      const r = (await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
        context: true,
        pages: true, // bắt buộc để trả về số trang PDF (mặc định không trả)
      })) as RawResource;
      return toDTO({ ...r, resource_type: resourceType }, cloudName);
    } catch {
      // 404 ở type này -> thử type còn lại
    }
  }
  return null;
}
