// Nguồn tĩnh demo cho nhánh "Video bài giảng" (không dùng Cloudinary).
// Bạn xem trước với vài video mẫu, sau này thay bằng danh sách thật của bạn.

export type ListVideo = {
  id: string;
  title: string;
  subject: string; // Môn học
  description: string;
  youtubeId: string; // ID video YouTube (phần sau v=)
  channel: string;
  duration: string; // vd: "12:45"
  uploadedAt: string;
};

export const DEMO_VIDEOS: ListVideo[] = [
  {
    id: "toan-lop9-can-bac-hai",
    title: "Toán 9 - Căn bậc hai và hằng đẳng thức đáng nhớ",
    subject: "Toán",
    description: "Ôn lại định nghĩa căn bậc hai, điều kiện xác định và các dạng bài rút gọn thường gặp trong đề thi.",
    youtubeId: "eKFTSSKCzWA",
    channel: "Học Toán Online",
    duration: "18:24",
    uploadedAt: "12/09/2026",
  },
  {
    id: "van-lop9-chuyen-ngu-van",
    title: "Ngữ văn 9 - Chuyện người con gái Nam Xương (phân tích chi tiết)",
    subject: "Ngữ văn",
    description: "Phân tích nhân vật Vũ Nương, bi kịch số phận và giá trị hiện thực - nhân đạo của tác phẩm.",
    youtubeId: "aqz-KE-bpKQ",
    channel: "Văn Học Mỗi Ngày",
    duration: "22:10",
    uploadedAt: "10/09/2026",
  },
  {
    id: "anh-lop9-thi-hien-tai",
    title: "Tiếng Anh 9 - Tổng hợp 12 thì + bài tập trắc nghiệm",
    subject: "Tiếng Anh",
    description: "Hệ thống nhanh 12 thì tiếng Anh, dấu hiệu nhận biết và mẹo làm bài thi vào 10.",
    youtubeId: "9vA5jaR-Y_c",
    channel: "English Mastery",
    duration: "25:37",
    uploadedAt: "08/09/2026",
  },
  {
    id: "ly-lop9-dinh-luat-ohm",
    title: "Vật lý 9 - Định luật Ôm và bài tập mạch điện",
    subject: "Vật lý",
    description: "Hiểu bản chất định luật Ôm, cách tính điện trở tương đương mạch nối tiếp và song song.",
    youtubeId: "LXb3EKWsInQ",
    channel: "Vật Lý Vui",
    duration: "15:52",
    uploadedAt: "05/09/2026",
  },
  {
    id: "hoa-lop9-oxit-axit",
    title: "Hóa học 9 - Oxit, Axit, Bazơ, Muối (tổng ôn 1 tiết)",
    subject: "Hóa học",
    description: "Sơ đồ tính chất hóa học các hợp chất vô cơ và chuỗi phản ứng hay ra trong đề giữa kì.",
    youtubeId: "RgKAFK5djSk",
    channel: "Hóa Học Dễ Hiểu",
    duration: "20:05",
    uploadedAt: "02/09/2026",
  },
  {
    id: "su-lop9-viet-nam-hien-dai",
    title: "Lịch sử 9 - Việt Nam từ 1945 đến nay (tóm tắt nhanh)",
    subject: "Lịch sử",
    description: "Tóm tắt timeline các sự kiện trọng tâm, sơ đồ tư duy nhớ nhanh để làm trắc nghiệm.",
    youtubeId: "inpok4MKVLM",
    channel: "Sử Hay",
    duration: "16:48",
    uploadedAt: "28/08/2026",
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
