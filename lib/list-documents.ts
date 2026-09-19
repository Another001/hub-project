// Kiểu dữ liệu + hàm lọc cho màn list-document (mẫu StudyShelf).
// Dữ liệu mẫu nằm ở data/list-documents.json (copy từ file HTML của bạn,
// thêm fileUrl để preview/tải thật).
// Sau này muốn lấy từ Cloudinary theo tag thì thay hàm getListDocuments()
// bằng getDocuments() trong lib/documents.ts (đã làm sẵn ở màn tai-lieu).

import sampleData from "@/data/list-documents.json";

// 1 tài liệu trong thư viện StudyShelf.
export type ListDocument = {
  id: string;
  title: string;
  subject: string; // Môn học
  grade: string; // Khối / lớp
  type: string; // Loại: Giáo trình, Bài tập...
  description: string; // Mô tả ngắn (hiện ở thẻ)
  fullDescription: string; // Mô tả dài (hiện ở chi tiết)
  fileUrl: string; // Link PDF: Cloudinary Secure URL hoặc link demo
  fileSize: string; // vd: "4.8 MB"
  pageCount: number;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
};

// Đọc danh sách (hiện tại trả dữ liệu mẫu, bọc async để sau đổi sang fetch Cloudinary không phải sửa màn hình).
export async function getListDocuments(): Promise<ListDocument[]> {
  return sampleData as ListDocument[];
}

// Lấy các giá trị duy nhất của 1 trường để đổ vào ô select lọc.
export function uniqueValues(docs: ListDocument[], field: "subject" | "grade" | "type"): string[] {
  return Array.from(new Set(docs.map((d) => d[field])));
}

// Lọc client-side: tìm kiếm theo tên/môn/mô tả/tags + 3 bộ lọc.
export function filterListDocuments(
  docs: ListDocument[],
  opts: { q: string; subject: string; grade: string; type: string }
): ListDocument[] {
  const q = opts.q.trim().toLowerCase();
  return docs.filter((d) => {
    const matchQ =
      !q ||
      [d.title, d.subject, d.description, ...d.tags].join(" ").toLowerCase().includes(q);
    return (
      matchQ &&
      (!opts.subject || d.subject === opts.subject) &&
      (!opts.grade || d.grade === opts.grade) &&
      (!opts.type || d.type === opts.type)
    );
  });
}

// Link tải: gắn fl_attachment để trình duyệt download thay vì mở.
// Chỉ áp dụng cho link Cloudinary, link demo giữ nguyên.
export function toListDownloadUrl(fileUrl: string): string {
  if (fileUrl.includes("res.cloudinary.com") && !fileUrl.includes("fl_attachment")) {
    return fileUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  }
  return fileUrl;
}
