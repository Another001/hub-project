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

// Map resource thô -> DTO sạch trả cho FE (chỉ giữ field cần hiển thị).
function toDTO(r: RawResource, cloudName: string): ListDocument {
  const custom = r.context?.custom ?? {};
  const fileName = r.public_id.split("/").pop() ?? r.public_id;
  // Link xem phải đúng resource_type nơi file đang lưu (image hay raw).
  const fileUrl = `https://res.cloudinary.com/${cloudName}/${r.resource_type}/upload/v${r.version}/${r.public_id}.${r.format}`;
  return {
    id: encodeURIComponent(r.public_id),
    title: custom.title ?? fileName.replace(/[-_]/g, " "),
    subject: custom.subject ?? "Chưa phân loại",
    grade: custom.grade ?? "Tất cả",
    type: custom.type ?? "Tài liệu",
    description: custom.description ?? "",
    fullDescription: custom.description ?? "",
    fileUrl,
    fileSize: formatBytes(r.bytes ?? 0),
    pageCount: r.pages ?? Number(custom.pages) ?? 0,
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

// Lấy HẾT resource gắn tag (PDF có thể nằm ở type image hoặc raw nên gọi cả 2).
// Quy mô đồ án vài trăm file thì lặp next_cursor vài vòng là xong.
async function fetchAllByTag(tag: string): Promise<RawResource[]> {
  const out: RawResource[] = [];
  for (const resourceType of ["image", "raw"]) {
    let nextCursor: string | undefined = undefined;
    do {
      const res = (await cloudinary.api.resources_by_tag(tag, {
        resource_type: resourceType,
        max_results: 500,
        context: true, // kèm context.custom (title, subject...) bạn gắn khi upload
        next_cursor: nextCursor,
      })) as { resources: RawResource[]; next_cursor?: string };
      out.push(...(res.resources ?? []));
      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
  return out;
}

// HÀM 1: Đếm số tài liệu gắn tag. FE: const n = await countDocuments("tai-lieu")
export async function countDocuments(tag = "tai-lieu"): Promise<number> {
  config();
  const all = await fetchAllByTag(tag);
  return all.length;
}

// HÀM 2: Liệt kê tài liệu (lọc sẵn theo từ khóa/môn/lớp/loại).
// FE gọi 1 lần lúc mở trang, rồi lọc tiếp client-side như hiện tại cũng được.
export async function listDocuments(opts?: {
  q?: string;
  subject?: string;
  grade?: string;
  type?: string;
  tag?: string;
}): Promise<{ docs: ListDocument[]; total: number }> {
  const cloudName = config();
  const tag = opts?.tag ?? "tai-lieu";
  const q = (opts?.q ?? "").trim().toLowerCase();

  const docs = fetchAllByTag(tag)
    .then((all) => all.map((r) => toDTO(r, cloudName)))
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
      })) as RawResource;
      return toDTO({ ...r, resource_type: resourceType }, cloudName);
    } catch {
      // 404 ở type này -> thử type còn lại
    }
  }
  return null;
}
