// File cấu hình Cloudinary dùng chung cho FE.
// Cloud của bạn: dm7ygxjmc
// Lưu ý: đây toàn là link public, KHÔNG để lộ API_SECRET ở FE.

export const CLOUD_NAME = "dm7ygxjmc";

// Tag chung gắn cho mọi tài liệu khi upload tay trên dashboard.
export const DEFAULT_TAG = "tai-lieu";

// 3 URL thử theo thứ tự: any -> image -> raw
// Lý do: PDF upload tay có thể rơi vào resource_type "image" hoặc "raw",
// tùy cách Cloudinary nhận diện. Thử "any" trước là bao quát nhất.
export function buildListUrls(tag: string = DEFAULT_TAG): string[] {
  return [
    `https://res.cloudinary.com/${CLOUD_NAME}/any/list/${tag}.json`,
    `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json`,
    `https://res.cloudinary.com/${CLOUD_NAME}/raw/list/${tag}.json`,
  ];
}

// Kiểu 1 item trả về từ API list theo tag của Cloudinary.
export type CloudinaryListResource = {
  public_id: string; // vd: "tai-lieu/toan-10-chuong-1"
  version: number; // số version để ghép URL chính xác
  format: string; // vd: "pdf"
  bytes?: number; // dung lượng file
  created_at?: string;
  // context.custom do bạn tự thêm khi upload (title, subject...)
  context?: { custom?: Record<string, string> };
};

// Dựng link XEM trực tiếp (mở trên trình duyệt / cho react-pdf tải).
export function buildFileUrl(r: CloudinaryListResource): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v${r.version}/${r.public_id}.${r.format}`;
}

// Dựng link TẢI XUỐNG (ép trình duyệt download thay vì mở).
// Thêm fl_attachment vào URL là Cloudinary tự trả về dạng attachment.
export function buildDownloadUrl(r: CloudinaryListResource): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/fl_attachment/v${r.version}/${r.public_id}.${r.format}`;
}

// Fetch danh sách file theo tag, thử lần lượt 3 URL ở trên.
// Fetch được cái nào thì dùng ngay, tất cả lỗi thì throw để code gọi fallback sang JSON local.
export async function fetchResourcesByTag(
  tag: string = DEFAULT_TAG
): Promise<CloudinaryListResource[]> {
  const urls = buildListUrls(tag);
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue; // 404/403 -> thử URL tiếp theo
      const data = await res.json();
      if (Array.isArray(data?.resources)) return data.resources;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("Không lấy được danh sách từ Cloudinary");
}
