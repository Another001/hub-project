// Khung xem trước PDF thật bằng react-pdf, giao diện theo mẫu chi-tiet-tai-lieu.html:
// toolbar (tên file + zoom tròn + toàn màn hình), canvas xám, pagination.
// Logic giữ nguyên: đọc PDF thật từ fileUrl, zoom 80–130%, chuyển trang trước/sau,
// đo khung chứa để vừa mobile, lỗi tải -> nút mở tab mới.
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minus, Plus } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker đọc PDF lấy từ CDN, khỏi copy file vào dự án.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudyPdfViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const [numPages, setNumPages] = useState(1); // tổng số trang
  const [page, setPage] = useState(1); // trang đang xem
  const [zoom, setZoom] = useState(100); // % zoom, giới hạn 80–130
  const [error, setError] = useState("");
  // Đo chiều rộng khung chứa để trang PDF co vừa mobile (không vuốt ngang).
  const wrapRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const [wrapWidth, setWrapWidth] = useState(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWrapWidth(el.clientWidth);
    update(); // đo ngay lần đầu
    const ro = new ResizeObserver(update); // xoay màn hình / resize thì đo lại
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Toàn màn hình khung đọc (trình duyệt không hỗ trợ thì thôi, không báo lỗi).
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await readerRef.current?.requestFullscreen();
    } catch {
      /* bỏ qua */
    }
  };

  return (
    <section className="dt-reader" ref={readerRef} aria-label="Trình đọc tài liệu PDF">
      {/* Toolbar: tên file + zoom + toàn màn hình */}
      <div className="dt-toolbar">
        <div className="dt-filename">
          <svg className="dt-pdf-small" viewBox="0 0 32 40" aria-hidden="true">
            <path d="M4 1h16l9 10v28H4Z M20 1v11h9" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="16.5" y="30" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Arial" fontWeight="bold">PDF</text>
          </svg>
          <span>{title}.pdf</span>
        </div>
        <div className="dt-controls">
          <button onClick={() => setZoom((z) => Math.max(80, z - 10))} className="dt-circle" type="button" aria-label="Thu nhỏ" disabled={zoom <= 80}>
            <Minus className="icon" aria-hidden="true" />
          </button>
          <output className="dt-zoom" aria-live="polite">{zoom}%</output>
          <button onClick={() => setZoom((z) => Math.min(130, z + 10))} className="dt-circle" type="button" aria-label="Phóng to" disabled={zoom >= 130}>
            <Plus className="icon" aria-hidden="true" />
          </button>
          <span className="dt-divider" aria-hidden="true" />
          <button onClick={toggleFullscreen} className="dt-circle" type="button" aria-label="Toàn màn hình">
            <Maximize className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Thân khung: trang PDF thật */}
      <div className="dt-canvas">
        {error ? (
          <div className="dt-state">
            <p className="lv-error">Không xem trước được PDF</p>
            <p>{error}</p>
            <div className="dt-state-row">
              <a href={fileUrl} target="_blank" rel="noopener" className="primary">
                Mở trong tab mới
              </a>
            </div>
          </div>
        ) : (
          // Trang PDF rộng đúng bằng khung chứa (nhân zoom), mobile không tràn.
          <div ref={wrapRef} style={{ margin: "0 auto", maxWidth: 700, background: "#fff", boxShadow: "0 7px 24px #1b2d3b20" }}>
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPage(1); }}
              onLoadError={() => setError("Link Cloudinary chưa đúng hoặc file chưa public. Kiểm tra lại Secure URL.")}
              loading={<p style={{ background: "#fff", padding: 40, color: "var(--muted)" }}>Đang tải PDF...</p>}
            >
              <Page pageNumber={page} width={wrapWidth ? Math.floor((wrapWidth * zoom) / 100) : undefined} />
            </Document>
          </div>
        )}
      </div>

      {/* Chân khung: chuyển trang */}
      <div className="dt-pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="dt-circle" type="button" aria-label="Trang trước" disabled={page <= 1}>
          <ChevronLeft className="icon" aria-hidden="true" />
        </button>
        <span className="dt-label">Trang</span>
        <span>{page} / {numPages}</span>
        <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} className="dt-circle" type="button" aria-label="Trang tiếp theo" disabled={page >= numPages}>
          <ChevronRight className="icon" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
