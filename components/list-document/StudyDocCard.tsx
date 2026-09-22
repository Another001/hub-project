// Thẻ tài liệu, giao diện theo mẫu thu-vien-toan.html:
// category TOÁN·LỚP + icon PDF đỏ, tiêu đề, mô tả, meta, actions Xem + download tròn.
// Logic giữ nguyên: mọi nút đều sang màn chi tiết /list-document/[id].
"use client";

import { ArrowRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ListDocument } from "@/lib/list-documents";

export default function StudyDocCard({ doc }: { doc: ListDocument }) {
  const router = useRouter();
  const open = () => router.push(`/list-document/${doc.id}`);

  const category = doc.grade ? `TOÁN · ${doc.grade}`.toUpperCase() : "TOÁN";
  const meta = doc.pageCount > 0 ? `PDF · ${doc.pageCount} trang · ${doc.fileSize}` : `PDF · ${doc.fileSize}`;

  return (
    <article className="card">
      <div className="card-head">
        <div className="min-w-0">
          <span className="category">{category}</span>
          <h3 className="lv-h3">{doc.title}</h3>
        </div>
        {/* Icon PDF đỏ đúng mẫu */}
        <svg className="pdf" viewBox="0 0 32 40" aria-label="Tệp PDF" role="img">
          <path d="M4 1h16l9 10v28H4Z M20 1v11h9" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="7" y="21" width="19" height="12" rx="2" fill="currentColor" />
          <text x="16.5" y="30" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial" fontWeight="bold">PDF</text>
        </svg>
      </div>
      <p className="card-desc">{doc.description}</p>
      <div className="meta">{meta}</div>
      <div className="card-actions">
        <button className="view" type="button" onClick={open}>
          Xem tài liệu
          <ArrowRight className="icon" aria-hidden="true" />
        </button>
        <button className="download" type="button" onClick={open} aria-label={`Xem ${doc.title}`}>
          <Download className="icon" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
