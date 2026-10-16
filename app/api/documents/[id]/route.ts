// DELETE /api/documents/[id] — xóa file đã upload, BẮT BUỘC đã unlock (cookie).
// id là public_id Cloudinary đã encode (đúng chuẩn id DTO).
// Thử resource_type image trước rồi raw (file cũ), thành công trả 200 { ok: true }.
import { NextResponse, type NextRequest } from "next/server";
import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { isUnauthorizedError, requireAuth } from "@/lib/auth";
import { clientIp, rateLimit, sweepRateLimit } from "@/lib/rate-limit";

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  sweepRateLimit();
  try {
    requireAuth(); // <-- gate cookie ở đây (giống upload)
  } catch (e) {
    if (isUnauthorizedError(e)) return bad("Chưa mở khóa. Hãy nhập mã truy cập.", 401);
    throw e;
  }
  if (!sameHostOnly(req)) return bad("Origin không hợp lệ.", 403);

  const ip = clientIp(req.headers);
  const rl = rateLimit(`delete:${ip}`, 20, 10 * 60_000); // 20 lần xóa/10 phút/IP
  if (!rl.ok) return bad(`Thao tác quá nhiều. Thử lại sau ${rl.retryAfterSec}s.`, 429);

  let publicId = "";
  try {
    publicId = decodeURIComponent(params.id);
  } catch {
    return bad("ID không hợp lệ.");
  }
  if (!publicId) return bad("Thiếu ID tài liệu.");

  configCloudinary();
  // File mới lưu dạng image, file cũ có thể là raw -> thử cả 2.
  for (const resourceType of ["image", "raw"] as const) {
    try {
      const res = (await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      })) as { result?: string };
      if (res.result === "ok" || res.result === "not found") {
        return NextResponse.json({ ok: true });
      }
    } catch {
      // thử type còn lại
    }
  }
  return bad("Xóa trên Cloudinary thất bại. Thử lại sau.", 502);
}
