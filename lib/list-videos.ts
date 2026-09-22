// Nguồn video của thư viện (không dùng Cloudinary).
// Mở video: bấm thẻ -> tab YouTube mới. Thumbnail + link tự sinh từ youtubeId.

export type ListVideo = {
  id: string;
  title: string;
  subject: string; // Môn học
  description: string;
  youtubeId: string; // ID video YouTube (phần sau v=)
  channel: string;
  duration: string; // vd: "12:45", rỗng = ẩn badge thời lượng
  uploadedAt: string; // rỗng = ẩn ngày cập nhật
};

export const DEMO_VIDEOS: ListVideo[] = [
  {
    id: "toan-hinh-co-ban-mat-goc",
    title: "Đào tận gốc LÝ THUYẾT TOÁN HÌNH CƠ BẢN",
    subject: "Toán",
    description: "Ôn tận gốc lý thuyết toán hình cơ bản, phù hợp cho bạn mất gốc cần lấy lại nền tảng.",
    youtubeId: "3ALECm0UdIk",
    channel: "Mr Mất Gốc",
    duration: "",
    uploadedAt: "",
  },
  {
    id: "bai-toan-300-nam",
    title: "Bài Toán Đơn Giản Nhất Khiến Cả Thế Giới Bó Tay Suốt 300 Năm",
    subject: "Toán",
    description: "Câu chuyện về bài toán tưởng đơn giản nhưng khiến cả thế giới bó tay suốt 300 năm.",
    youtubeId: "KaWXZm_XUq8",
    channel: "Học thêm toán",
    duration: "",
    uploadedAt: "",
  },
  {
    id: "oldest-unsolved-problem-math",
    title: "The Oldest Unsolved Problem in Math",
    subject: "Toán",
    description: "Video tiếng Anh khám phá bài toán mở lâu đời nhất của toán học.",
    youtubeId: "Zrv1EDIqHkY",
    channel: "Veritasium",
    duration: "",
    uploadedAt: "",
  },
  {
    id: "fermat-last-theorem-oxford",
    title: "What is Fermat's Last Theorem?",
    subject: "Toán",
    description: "Video tiếng Anh giải thích Định lý cuối cùng của Fermat từ Đại học Oxford.",
    youtubeId: "1BSFyEIY2BY",
    channel: "University of Oxford",
    duration: "",
    uploadedAt: "",
  },
];

// Link xem YouTube từ youtubeId.
export function toYouTubeUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

// Thumbnail chất lượng cao của YouTube.
export function toYouTubeThumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

// Lọc video theo ô tìm kiếm (tiêu đề/môn/mô tả/kênh).
export function filterListVideos(videos: ListVideo[], q: string): ListVideo[] {
  const query = q.trim().toLowerCase();
  if (!query) return videos;
  return videos.filter((v) =>
    [v.title, v.subject, v.description, v.channel].join(" ").toLowerCase().includes(query)
  );
}
