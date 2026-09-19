// Phân trang đơn giản: Nút Trước/Sau + số trang.
// page bắt đầu từ 1. onChange(pageMoi) để cha cắt lại danh sách.
"use client";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function DocumentPagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null; // 1 trang thì khỏi hiện
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40"
      >
        ← Trước
      </button>
      <span className="text-sm text-gray-600">
        Trang {page}/{totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40"
      >
        Sau →
      </button>
    </div>
  );
}
