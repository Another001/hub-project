// Khung xem trước PDF thật bằng react-pdf, style theo mẫu StudyShelf.
// Khác file HTML mẫu (chỉ vẽ khung giả): ở đây đọc file PDF thật từ fileUrl.
// Tính năng: phóng to/thu nhỏ (80–130%), chuyển trang trước/sau.
// Lỗi tải (sai link Cloudinary, file chưa public) -> hiện nút mở tab mới.
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Minus, Plus } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker đọc PDF lấy từ CDN, khỏi copy file vào dự án.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudyPdfViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const [numPages, setNumPages] = useState(1); // tổng số trang (mặc định 1 như mẫu)
  const [page, setPage] = useState(1); // trang đang xem
  const [zoom, setZoom] = useState(100); // % zoom, mẫu giới hạn 80–130
  const [error, setError] = useState("");

  return (
    <section className="soft-card mt-8 overflow-hidden rounded-3xl bg-white">
      {/* Đầu khung: tên file + nút zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/70 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <FileText className="h-4 w-4 text-red-500" />
          <span>{title}.pdf</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(80, z - 10))} className="rounded-lg p-2 text-slate-600 hover:bg-white" type="button" aria-label="Thu nhỏ bản xem trước">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-11 text-center text-xs font-semibold text-slate-500">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(130, z + 10))} className="rounded-lg p-2 text-slate-600 hover:bg-white" type="button" aria-label="Phóng to bản xem trước">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thân khung: trang PDF thật, cuộn được */}
      <div className="overflow-auto bg-slate-100 p-5 sm:p-10">
        {error ? (
          <div className="mx-auto max-w-2xl rounded-sm bg-white p-10 text-center shadow-xl">
            <p className="font-semibold text-red-600">Không xem trước được PDF</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <a href={fileUrl} target="_blank" className="mt-4 inline-block rounded-xl bg-sky-500 px-5 py-2.5 font-semibold text-white">
              Mở trong tab mới
            </a>
          </div>
        ) : (
          <div className="mx-auto w-fit max-w-full" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPage(1); }}
              onLoadError={() => setError("Link Cloudinary chưa đúng hoặc file chưa public. Kiểm tra lại Secure URL.")}
              loading={<p className="bg-white p-10 text-slate-500">Đang tải PDF...</p>}
            >
              <Page pageNumber={page} />
            </Document>
          </div>
        )}
      </div>

      {/* Chân khung: chuyển trang */}
      <div className="flex items-center justify-center gap-4 border-t border-sky-100 py-4">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50" type="button" aria-label="Trang trước">
          <ChevronLeft />
        </button>
        <span className="text-sm font-semibold text-slate-600">{page} / {numPages}</span>
        <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50" type="button" aria-label="Trang tiếp theo">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
