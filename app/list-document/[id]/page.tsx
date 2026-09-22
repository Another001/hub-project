// MÀN 2: /list-document/[id] — Chi tiết, giao diện theo mẫu chi-tiet-tai-lieu.html.
// Logic giữ nguyên 100%: nạp chi tiết từ Cloudinary (getCloudDocument),
// màn loading / lỗi + Thử lại / không-tìm-thấy, nút Xem cuộn tới preview,
// nút Tải xuống mở link fl_attachment tab mới, toast.
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/list-document/SiteHeader";
import StudyPdfViewer from "@/components/list-document/StudyPdfViewer";
import StudyToast from "@/components/list-document/StudyToast";
import { getCloudDocument } from "@/lib/cloudinary-actions"; // Server Actions: chi tiết + list thật
import { toListDownloadUrl, type ListDocument } from "@/lib/list-documents";

export default function ListDocumentDetailPage({ params }: { params: { id: string } }) {
  const docId = decodeURIComponent(params.id); // Next 14: params là object thường
  const router = useRouter();
  const previewRef = useRef<HTMLSpanElement>(null);

  const [doc, setDoc] = useState<ListDocument | null>(null);
  const [loaded, setLoaded] = useState(false); // đã nạp xong dữ liệu
  const [error, setError] = useState(""); // lỗi gọi API (trống = không lỗi)

  // Nạp chi tiết 100% từ Cloudinary (không dữ liệu mẫu).
  // getCloudDocument null = sai id -> màn not-found; throw = lỗi API -> màn lỗi.
  const load = () => {
    setLoaded(false);
    setError("");
    getCloudDocument(docId)
      .then(async (found) => {
        if (!found) {
          setDoc(null);
          setLoaded(true);
          return;
        }
        setDoc(found);
        setLoaded(true);
      })
      .catch(() => {
        setError("Không tải được tài liệu. Kiểm tra mạng hoặc cấu hình Cloudinary rồi thử lại.");
        setLoaded(true);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Nút Tải xuống: mở link Cloudinary kèm fl_attachment + báo toast.
  const handleDownload = () => {
    if (!doc) return;
    window.open(toListDownloadUrl(doc.fileUrl), "_blank");
  };

  if (!loaded) {
    return (
      <main className="fade-in">
        <SiteHeader />
        <div className="lv-container dt-main">
          <p className="empty">Đang tải...</p>
        </div>
        <StudyToast message="" />
      </main>
    );
  }

  // Lỗi API -> màn lỗi + nút thử lại (không hiện dữ liệu giả).
  if (error) {
    return (
      <main className="fade-in">
        <SiteHeader />
        <div className="lv-container dt-main">
          <div className="dt-state">
            <h1 className="dt-h1">Không tải được tài liệu</h1>
            <p>{error}</p>
            <div className="dt-state-row">
              <button onClick={load} className="primary" type="button">
                Thử lại
              </button>
              <button onClick={() => router.push("/list-document")} className="outline" type="button">
                Về danh sách
              </button>
            </div>
          </div>
        </div>
        <StudyToast message="" />
      </main>
    );
  }

  // Không thấy id -> màn not-found.
  if (!doc) {
    return (
      <main className="fade-in">
        <SiteHeader />
        <div className="lv-container dt-main">
          <div className="dt-state">
            <h1 className="dt-h1">Không tìm thấy tài liệu</h1>
            <p>Tài liệu này có thể đã được di chuyển hoặc không còn tồn tại trong thư viện.</p>
            <div className="dt-state-row">
              <button onClick={() => router.push("/list-document")} className="primary" type="button">
                Về danh sách tài liệu
              </button>
            </div>
          </div>
        </div>
        <StudyToast message="" />
      </main>
    );
  }

  const meta: Array<[string, string]> = [
    ["NGƯỜI TẢI LÊN", doc.uploadedBy],
    ["CẬP NHẬT", doc.uploadedAt],
    ["DUNG LƯỢNG", doc.fileSize],
    ["SỐ TRANG", `${doc.pageCount} trang`],
  ];

  return (
    <main className="fade-in">
      <SiteHeader />
      <div className="lv-container dt-main">
        <button onClick={() => router.push("/list-document")} type="button" className="dt-back">
          <ArrowLeft className="icon" aria-hidden="true" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Thẻ thông tin chính */}
        <section className="dt-summary" aria-labelledby="document-title">
          <div className="dt-summary-top">
            <div className="dt-badge" aria-hidden="true">
              <svg viewBox="0 0 32 40" aria-label="Tệp PDF" role="img">
                <path d="M4 1h16l9 10v28H4Z M20 1v11h9" fill="none" stroke="currentColor" strokeWidth="2" />
                <text x="16.5" y="30" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Arial" fontWeight="bold">PDF</text>
              </svg>
            </div>
            <div className="dt-heading">
              <p className="dt-eyebrow">{doc.grade} · {doc.type}</p>
              <h1 className="dt-h1" id="document-title">{doc.title}</h1>
              <div className="dt-tags">
                {doc.tags.map((tag) => (
                  <span key={tag} className="dt-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="dt-actions">
              {/* Cuộn xuống khung preview */}
              <button onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} type="button" className="dt-btn dt-primary">
                <Eye className="icon" aria-hidden="true" />
                <span>Xem tài liệu</span>
              </button>
              <button onClick={handleDownload} type="button" className="dt-btn">
                <Download className="icon" aria-hidden="true" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
          {/* Meta 4 ô */}
          <dl className="dt-meta">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Khung preview PDF thật (neo để nút Xem tài liệu cuộn tới) */}
        <span ref={previewRef} className="block scroll-mt-24" />
        <p className="dt-note"><span>Nội dung PDF gốc từ thư viện</span></p>
        <StudyPdfViewer fileUrl={doc.fileUrl} title={doc.title} />

      </div>
      <footer className="lv-footer">
        <div className="lv-container footer-inner">
          <span>Trường THCS Lê Văn Tám　 | 　Cổng học liệu số</span>
          <span>Tri thức hôm nay – Vững bước tương lai</span>
        </div>
      </footer>
      <StudyToast message="" />
    </main>
  );
}
