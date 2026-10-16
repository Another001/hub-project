// Thẻ tài liệu, giao diện theo mẫu thu-vien-toan.html:
// category TOÁN·LỚP + icon PDF đỏ, tiêu đề, mô tả, meta, actions Xem + download tròn.
// Preview: ảnh trang đầu PDF (thumbUrl từ Cloudinary, full-width kiểu thẻ video).
// Không có thumb (PDF raw cũ) hoặc ảnh lỗi -> ẩn preview, giữ icon PDF.
// Logic giữ nguyên: mọi nút đều sang màn chi tiết /list-document/[id].
"use client";

import { useState } from "react";
import { ArrowRight, Download, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ListDocument } from "@/lib/list-documents";

export default function StudyDocCard({ doc, onDelete }: { doc: ListDocument; onDelete?: (doc: ListDocument) => void }) {
  const router = useRouter();
  const open = () => router.push(`/list-document/${doc.id}`);
  const [imgOk, setImgOk] = useState(true); // thumb lỗi -> ẩn, fallback icon
  const showThumb = Boolean(doc.thumbUrl) && imgOk;

  const category = doc.grade ? `TOÁN · ${doc.grade}`.toUpperCase() : "TOÁN";
  const isImage = /\.png$/i.test(doc.fileUrl);
  const meta = isImage
    ? `Ảnh PNG · ${doc.fileSize}`
    : doc.pageCount > 0 ? `PDF · ${doc.pageCount} trang · ${doc.fileSize}` : `PDF · ${doc.fileSize}`;

  return (
    <article className="card">
      {/* Preview trang đầu PDF, bấm vào sang chi tiết */}
      {showThumb ? (
        <button className="thumb-wrap" type="button" onClick={open} aria-label={`Xem ${doc.title}`} style={{ marginBottom: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={doc.thumbUrl as string} alt={`Trang đầu ${doc.title}`} loading="lazy" onError={() => setImgOk(false)} />
          <span className="thumb-time">{isImage ? "PNG" : doc.pageCount > 0 ? `${doc.pageCount} trang` : "PDF"}</span>
        </button>
      ) : null}
      <div className="card-head">
        <div className="min-w-0">
          <span className="category">{category}</span>
          <h3 className="lv-h3">{doc.title}</h3>
        </div>
        {/* Badge loại file: PDF đỏ đúng mẫu, PNG icon ảnh */}
        {isImage ? (
          <span className="flex h-11 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600" role="img" aria-label="Tệp ảnh PNG">
            <ImageIcon className="h-5 w-5" />
          </span>
        ) : (
          <svg className="pdf" viewBox="0 0 32 40" aria-label="Tệp PDF" role="img">
            <path d="M4 1h16l9 10v28H4Z M20 1v11h9" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="7" y="21" width="19" height="12" rx="2" fill="currentColor" />
            <text x="16.5" y="30" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial" fontWeight="bold">PDF</text>
          </svg>
        )}
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
        {onDelete ? (
          <button
            className="download"
            type="button"
            onClick={() => onDelete(doc)}
            aria-label={`Xóa ${doc.title}`}
            title="Xóa tài liệu"
            style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" }}
          >
            <Trash2 className="icon" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
