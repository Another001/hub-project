// Khung xem trước PDF bằng react-pdf (pdf.js).
// Chức năng: chuyển trang, phóng to/thu nhỏ, mở tab mới.
// Nếu file lỗi/CORS chặn -> hiện thông báo + nút mở tab mới (iframe fallback).
"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// CSS mặc định của react-pdf để trang PDF hiển thị đúng.
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker giúp trình duyệt đọc PDF nhanh, load từ CDN (không cần copy file).
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState(0); // tổng số trang
  const [page, setPage] = useState(1); // trang đang xem
  const [scale, setScale] = useState(1.0); // mức zoom
  const [error, setError] = useState(""); // lỗi tải file

  return (
    <div className="overflow-hidden rounded-xl border bg-gray-50">
      {/* Thanh công cụ: chuyển trang + zoom */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-white p-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border px-3 py-1 disabled:opacity-40"
        >
          ←
        </button>
        <span className="text-sm">
          Trang {page}/{numPages || "?"}
        </span>
        <button
          disabled={page >= numPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border px-3 py-1 disabled:opacity-40"
        >
          →
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} className="rounded-lg border px-3 py-1">−</button>
          <span className="px-1 text-sm">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(2.5, s + 0.2))} className="rounded-lg border px-3 py-1">+</button>
        </div>
      </div>

      {/* Vùng hiển thị PDF, cho cuộn dọc */}
      <div className="flex max-h-[700px] justify-center overflow-auto p-4">
        {error ? (
          // Lỗi (sai link, chưa upload, CORS): hướng dẫn + mở tab mới.
          <div className="py-10 text-center text-sm text-gray-600">
            <p className="mb-2 font-semibold text-red-600">Không xem trước được PDF</p>
            <p className="mb-4">{error}</p>
            <a href={fileUrl} target="_blank" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Mở trong tab mới
            </a>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPage(1); }}
            onLoadError={() => setError("Link Cloudinary chưa đúng hoặc file chưa public. Kiểm tra lại Secure URL.")}
            loading={<p className="py-10 text-gray-500">Đang tải PDF...</p>}
          >
            <Page pageNumber={page} scale={scale} />
          </Document>
        )}
      </div>
    </div>
  );
}
