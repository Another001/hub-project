// Thẻ hiển thị 1 tài liệu trong lưới danh sách.
// Props: doc là dữ liệu, đã có sẵn link xem/tải trong doc.fileUrl.
import Link from "next/link";
import { formatSize, type Document } from "@/lib/documents";

export default function DocumentCard({ doc }: { doc: Document }) {
  return (
    // Click vào thẻ -> sang màn chi tiết /tai-lieu/[id]
    <Link
      href={`/tai-lieu/${doc.id}`}
      className="group rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* Icon PDF + tên file */}
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm font-bold text-red-600">
          PDF
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold group-hover:text-blue-600">
            {doc.title}
          </h3>
          <p className="text-sm text-gray-500">
            {doc.subject} • {doc.grade}
          </p>
        </div>
      </div>
      {/* Mô tả ngắn */}
      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{doc.description}</p>
      {/* Thông tin phụ: dung lượng, lượt tải */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{formatSize(doc.size)}</span>
        <span>⬇ {doc.downloads} lượt tải</span>
      </div>
    </Link>
  );
}
