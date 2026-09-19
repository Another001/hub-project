// MÀN 2: /list-document/[id] — Chi tiết đúng mẫu StudyShelf.
// Gồm: header, breadcrumb, nút quay lại, thẻ thông tin (icon + môn·lớp·loại +
// tiêu đề + mô tả + tags + nút Xem/Tải), lưới meta 4 ô, khung preview PDF thật,
// khối tài liệu liên quan, màn không-tìm-thấy, toast.
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Download, Eye, FileQuestion, FileText } from "lucide-react";
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
  // const [related, setRelated] = useState<ListDocument[]>([]);
  const [loaded, setLoaded] = useState(false); // đã nạp xong dữ liệu
  const [error, setError] = useState(""); // lỗi gọi API (trống = không lỗi)
  // const [toast, setToast] = useState("");
  // const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // const showToast = (msg: string) => {
  //   setToast(msg);
  //   if (toastTimer) clearTimeout(toastTimer);
  //   setToastTimer(setTimeout(() => setToast(""), 3200));
  // };

  // Nạp chi tiết 100% từ Cloudinary (không dữ liệu mẫu).
  // getCloudDocument null = sai id -> màn not-found; throw = lỗi API -> màn lỗi.
  const load = () => {
    setLoaded(false);
    setError("");
    // const pickRelated = (all: ListDocument[], found: ListDocument) => {
    //   const same = all.filter((d) => d.id !== found.id && (d.subject === found.subject || d.type === found.type));
    //   setRelated((same.length ? same : all.filter((d) => d.id !== found.id)).slice(0, 3));
    // };
    getCloudDocument(docId)
      .then(async (found) => {
        if (!found) {
          setDoc(null);
          setLoaded(true);
          return;
        }
        setDoc(found);
        // Lấy list để gợi ý liên quan; lỗi thì thôi, vẫn hiện chi tiết.
        // await listDocuments({})
        //   .then(({ docs }) => pickRelated(docs, found))
        //   .catch(() => setRelated([]));
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
  //  showToast(`Đã chuẩn bị tải xuống “${doc.title}”.`);
  };

  if (!loaded) return <main className="mx-auto max-w-7xl p-8 text-slate-500">Đang tải...</main>;

  // Lỗi API -> màn lỗi + nút thử lại (không hiện dữ liệu giả).
  if (error) {
    return (
      <main>
        <SiteHeader />
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <div className="soft-card rounded-3xl bg-white p-10">
            <h1 className="font-display mt-2 text-[28px] font-bold text-slate-800">Không tải được tài liệu</h1>
            <p className="mt-3 text-slate-500">{error}</p>
            <div className="mt-7 flex justify-center gap-3">
              <button onClick={load} className="rounded-xl px-5 py-3 font-semibold text-white hover:brightness-95" style={{ background: "#4f9fd1" }} type="button">
                Thử lại
              </button>
              <button onClick={() => router.push("/list-document")} className="rounded-xl border border-sky-200 bg-white px-5 py-3 font-semibold text-sky-700" type="button">
                Về danh sách
              </button>
            </div>
          </div>
        </section>
        <StudyToast message="" />
      </main>
    );
  }

  // Không thấy id -> màn not-found đúng mẫu.
  if (!doc) {
    return (
      <main>
        <SiteHeader />
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <div className="soft-card rounded-3xl bg-white p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FileQuestion />
            </div>
            <h1 className="font-display mt-6 text-[32px] font-bold text-slate-800">Không tìm thấy tài liệu</h1>
            <p className="mt-3 text-slate-500">Tài liệu này có thể đã được di chuyển hoặc không còn tồn tại trong thư viện.</p>
            <button onClick={() => router.push("/list-document")} className="mt-7 rounded-xl px-5 py-3 font-semibold text-white hover:brightness-95" style={{ background: "#4f9fd1" }} type="button">
              Về danh sách tài liệu
            </button>
          </div>
        </section>
        <StudyToast message="" />
      </main>
    );
  }

  const meta: Array<[string, string]> = [
    ["Người tải lên", doc.uploadedBy],
    ["Cập nhật", doc.uploadedAt],
    ["Dung lượng", doc.fileSize],
    ["Số trang", `${doc.pageCount} trang`],
  ];

  return (
    <main className="fade-in">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Breadcrumb Tài liệu > tên tài liệu */}
        <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => router.push("/list-document")} className="font-medium hover:text-sky-700" type="button">
            Tài liệu
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate font-medium text-slate-700">{doc.title}</span>
        </nav>
        <button onClick={() => router.push("/list-document")} type="button" className="mb-7 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Thẻ thông tin chính */}
        <section className="soft-card rounded-3xl bg-white p-6 sm:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl gap-4 sm:gap-5">
              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <FileText className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 text-sm font-semibold text-sky-700">{doc.subject} · {doc.grade} · {doc.type}</div>
                <h1 className="font-display text-2xl font-semibold leading-tight text-slate-800 sm:text-4xl">{doc.title}</h1>
                <p className="mt-4 leading-7 text-slate-600">{doc.fullDescription}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Mobile: 2 nút chia đều full hàng; sm+ mới co theo nội dung */}
            <div className="flex shrink-0 flex-wrap gap-3">
              {/* Cuộn xuống khung preview */}
              <button onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition hover:brightness-95 sm:flex-none" style={{ background: "#4f9fd1" }}>
                <Eye className="h-4 w-4" />
                <span>Xem tài liệu</span>
              </button>
              <button onClick={handleDownload} type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 font-semibold text-sky-700 transition hover:bg-sky-100 sm:flex-none">
                <Download className="h-4 w-4" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
          {/* Meta 4 ô */}
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-sky-100 pt-6 sm:grid-cols-4">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Khung preview PDF thật (neo để nút Xem tài liệu cuộn tới) */}
        <span ref={previewRef} className="block scroll-mt-24" />
        <StudyPdfViewer fileUrl={doc.fileUrl} title={doc.title} />

      </div>
      <StudyToast message="" />
    </main>
  );
}
