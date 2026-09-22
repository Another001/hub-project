// Kiểu dữ liệu + hằng filter + hàm lọc cho màn list-document.
// Dữ liệu 100% từ Cloudinary qua Server Actions (lib/cloudinary-actions.ts).
// KHÔNG còn dữ liệu mẫu local: fetch lỗi thì màn hình báo lỗi, không hiện dữ liệu giả.

// 1 tài liệu trong thư viện StudyShelf (khớp DTO server trả về).
export type ListDocument = {
  id: string;
  title: string;
  subject: string; // Môn học
  grade: string; // Khối / lớp
  type: string; // Loại: Giáo trình, Bài tập...
  description: string; // Mô tả ngắn (hiện ở thẻ)
  fullDescription: string; // Mô tả dài (hiện ở chi tiết)
  fileUrl: string; // Link PDF: Secure URL Cloudinary
  thumbUrl: string | null; // Ảnh preview trang đầu (Cloudinary pg_1), null = PDF raw cũ -> hiện icon
  fileSize: string; // vd: "4.8 MB"
  pageCount: number;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[]; // tags Cloudinary (dùng để lọc AND nhiều dropdown)
};

// 1 mục trong dropdown tag: label hiện cho user, tag gửi lên API.
export type TagOption = { label: string; tag: string };

// Dropdown Lớp: Lớp 6-9 <-> tag lop-6..lop-9 (tag gắn trên file Cloudinary).
export const GRADE_OPTIONS: TagOption[] = [
  { label: "Lớp 6", tag: "lop-6" },
  { label: "Lớp 7", tag: "lop-7" },
  { label: "Lớp 8", tag: "lop-8" },
  { label: "Lớp 9", tag: "lop-9" },
];

// Dropdown Tài liệu ôn thi <-> tag giua-ki/cuoi-ki/tong-hop.
// Tag đặc biệt VIDEO_TAG: không gửi lên Cloudinary, FE chuyển sang nhánh video YouTube tĩnh.
export const VIDEO_TAG = "video-bai-giang";
export const EXAM_OPTIONS: TagOption[] = [
  { label: "Đề thi", tag: "de-thi" },
  { label: "Đề cương", tag: "de-cuong" },
  { label: "Tài liệu bổ sung", tag: "tai-lieu-bo-sung" },
  { label: "Truyện", tag: "truyen" },
  { label: "Video bài giảng", tag: VIDEO_TAG },
];

// Lọc văn bản client-side trên kết quả API (tên/môn/mô tả/tags).
export function filterListDocuments(docs: ListDocument[], q: string): ListDocument[] {
  const query = q.trim().toLowerCase();
  if (!query) return docs;
  return docs.filter((d) =>
    [d.title, d.subject, d.description, ...d.tags].join(" ").toLowerCase().includes(query)
  );
}

// Link tải: gắn fl_attachment để trình duyệt download thay vì mở.
// Chỉ áp dụng cho link Cloudinary (cả image/upload lẫn raw/upload).
export function toListDownloadUrl(fileUrl: string): string {
  if (fileUrl.includes("res.cloudinary.com") && !fileUrl.includes("fl_attachment")) {
    return fileUrl.replace(/(image|raw|video)\/upload\//, "$1/upload/fl_attachment/");
  }
  return fileUrl;
}
