// Toast báo thao tác theo mẫu thu-vien-toan.html: giữa đáy, nền #143c32, rỗng = ẩn.
// Logic giữ nguyên: cha truyền message, rỗng = ẩn.
"use client";

export default function StudyToast({ message }: { message: string }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
