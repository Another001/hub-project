// Logic dữ liệu tài liệu: đọc Cloudinary trước, lỗi thì dùng JSON local.
// FE thuần, không cần BE, không cần API_SECRET.

import fallbackData from "@/data/documents.json";
import {
  buildDownloadUrl,
  buildFileUrl,
  fetchResourcesByTag,
} from "./cloudinary";

// 1 tài liệu hiển thị trên web gồm các trường này.
export type Document = {
  id: string; // public_id encode, hoặc id tự đặt trong JSON
  title: string;
  subject: string; // Môn: Toán, Vật lý...
  grade: string; // Lớp 10/11/12
  description: string;
  fileUrl: string; // link xem trực tiếp (cho preview)
  size: number; // byte
  uploadedAt: string; // yyyy-mm-dd
  downloads: number;
  uploader: string;
};

// Link tải: thêm fl_attachment để ép download.
// Với file JSON local (link đã đầy đủ), chỉ cần gắn thêm fl_attachment nếu là link Cloudinary.
export function toDownloadUrl(fileUrl: string): string {
  if (fileUrl.includes("res.cloudinary.com") && !fileUrl.includes("fl_attachment")) {
    return fileUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  }
  return fileUrl;
}

// Đọc danh sách: thử Cloudinary theo tag trước, thất bại thì trả JSON local.
// Cách dùng: const docs = await getDocuments();
export async function getDocuments(): Promise<{
  docs: Document[];
  source: "cloudinary" | "local"; // cho UI biết đang dùng nguồn nào
}> {
  try {
    const resources = await fetchResourcesByTag("tai-lieu");
    if (resources.length === 0) throw new Error("empty");
    // Map từ field Cloudinary sang Document của web.
    const docs: Document[] = resources.map((r) => ({
      id: encodeURIComponent(r.public_id),
      title:
        r.context?.custom?.title ??
        r.public_id.split("/").pop()?.replace(/-/g, " ") ??
        r.public_id,
      subject: r.context?.custom?.subject ?? "Chưa phân loại",
      grade: r.context?.custom?.grade ?? "Tất cả",
      description: r.context?.custom?.description ?? "",
      fileUrl: buildFileUrl(r),
      size: r.bytes ?? 0,
      uploadedAt: (r.created_at ?? "").slice(0, 10),
      downloads: 0,
      uploader: "Giáo viên",
    }));
    // Giữ lại hàm buildDownloadUrl để dùng ở màn chi tiết khi cần.
    void buildDownloadUrl;
    return { docs, source: "cloudinary" };
  } catch {
    // Cloudinary chưa bật Resource list / chưa upload -> dùng file mẫu local.
    return { docs: fallbackData as Document[], source: "local" };
  }
}

// Lọc + tìm kiếm client-side (tên, môn, lớp, sắp xếp).
export function filterDocuments(
  docs: Document[],
  opts: { q: string; subject: string; grade: string; sort: string }
): Document[] {
  const q = opts.q.trim().toLowerCase();
  let out = docs.filter((d) => {
    const matchQ =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q);
    const matchS = opts.subject === "all" || d.subject === opts.subject;
    const matchG = opts.grade === "all" || d.grade === opts.grade;
    return matchQ && matchS && matchG;
  });
  if (opts.sort === "name") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
  else if (opts.sort === "downloads")
    out = [...out].sort((a, b) => b.downloads - a.downloads);
  else out = [...out].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)); // newest
  return out;
}

// Cắt trang client-side: page bắt đầu từ 1.
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

// Định dạng dung lượng cho đẹp: 2450000 -> "2.3 MB".
export function formatSize(bytes: number): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
