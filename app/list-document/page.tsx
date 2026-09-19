// MÀN 1: /list-document — Danh sách tài liệu đúng mẫu StudyShelf.
// Dữ liệu 100% từ Cloudinary qua Server Action (không còn dữ liệu mẫu local).
// Lọc: ô tìm kiếm văn bản + 2 dropdown tag (Lớp, Tài liệu ôn thi).
// Fetch lỗi -> hộp lỗi + nút Thử lại (không hiện dữ liệu giả).
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, SearchX } from "lucide-react";
import SiteHeader from "@/components/list-document/SiteHeader";
import StudyDocCard from "@/components/list-document/StudyDocCard";
import StudyToast from "@/components/list-document/StudyToast";
import TagDropdown from "@/components/list-document/TagDropdown";
import { listDocuments } from "@/lib/cloudinary-actions"; // Server Action: list thật từ Cloudinary (secret ở server)
import {
  EXAM_OPTIONS,
  GRADE_OPTIONS,
  filterListDocuments,
  type ListDocument,
} from "@/lib/list-documents";

export default function ListDocumentPage() {
  const [docs, setDocs] = useState<ListDocument[]>([]); // kết quả từ API theo tag đang chọn
  const [loading, setLoading] = useState(true); // đang gọi API
  const [error, setError] = useState(""); // lỗi gọi API (trống = không lỗi)
  const [q, setQ] = useState(""); // từ khóa tìm kiếm (lọc client-side)
  const [gradeTag, setGradeTag] = useState(""); // tag lớp: "" | lop-6..lop-9
  const [examTag, setExamTag] = useState(""); // tag kì thi: "" | giua-ki/cuoi-ki/tong-hop
  const [toast, setToast] = useState(""); // thông báo góc phải dưới
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Gọi API theo tag đang chọn (rỗng hết = đường all, chỉ lấy PDF).
  const load = useCallback((tags: string[]) => {
    setLoading(true);
    setError("");
    listDocuments({ tags })
      .then(({ docs }) => setDocs(docs))
      .catch(() => setError("Không tải được danh sách tài liệu. Kiểm tra mạng hoặc cấu hình Cloudinary rồi thử lại."))
      .finally(() => setLoading(false));
  }, []);

  // Đổi dropdown nào là gọi lại API với bộ tag mới.
  useEffect(() => {
    load([gradeTag, examTag].filter(Boolean));
  }, [gradeTag, examTag, load]);

  // Hiện toast 3.2s rồi tự ẩn (đúng mẫu HTML).
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    setToastTimer(setTimeout(() => setToast(""), 3200));
  };

  // Lọc văn bản client-side trên kết quả API đã trả về.
  const results = useMemo(() => filterListDocuments(docs, q), [docs, q]);
  const hasFilter = q || gradeTag || examTag;

  // Xóa hết bộ lọc (nút Xóa bộ lọc + nút trong empty state).
  const resetFilters = () => {
    setQ(""); setGradeTag(""); setExamTag("");
  };

  return (
    <main className="fade-in">
      <SiteHeader onAbout={() => showToast("StudyShelf là không gian tra cứu tài liệu học tập dành cho bạn.")} />

      {/* Hero: tiêu đề + ô tìm kiếm + thống kê */}
      <section className="hero-glow border-b border-sky-100">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
              Thư viện học tập
            </span>
            <h1 className="font-display mt-5 text-[26px] font-bold tracking-tight text-slate-800 sm:text-[32px]">
              Tài liệu học tập
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-7 text-slate-600 sm:text-[18px]">
              Nơi lưu trữ và tra cứu tài liệu PDF hữu ích cho hành trình học tập của bạn.
            </p>
          </div>
          {/* Ô tìm kiếm: mobile xếp chồng (input trên, nút dưới full), sm+ mới 1 hàng */}
          <form
            className="soft-card mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row sm:items-center"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Search className="ml-2 h-5 w-5 shrink-0 text-sky-500" />
              <label htmlFor="document-search" className="sr-only">Tìm kiếm tài liệu</label>
              <input
                id="document-search"
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-slate-700 outline-none"
                type="search"
                placeholder="Tìm kiếm tài liệu, môn học..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="w-full rounded-xl px-5 py-2.5 font-semibold text-white transition hover:brightness-95 sm:w-auto" style={{ background: "#4f9fd1" }} type="submit">
              Tìm kiếm
            </button>
          </form>
          {/* 3 thẻ thống kê tính từ dữ liệu thật */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">{docs.length}+ tài liệu chọn lọc</div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">{new Set(docs.map((d) => d.subject)).size} môn học đa dạng</div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">Cập nhật mỗi tuần</div>
          </div>
        </div>
      </section>

      {/* Khám phá: 2 dropdown tag + gợi ý + lưới thẻ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[24px] font-bold text-slate-800">Khám phá tài liệu</h2>
            <p className="mt-1 text-sm text-slate-500" aria-live="polite">
              {loading ? "Đang tải..." : `Hiển thị ${results.length} / ${docs.length} tài liệu`}
            </p>
          </div>
          {/* 2 dropdown lọc theo tag Cloudinary (mobile full hàng, sm+ 1 hàng) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <TagDropdown label="Lớp" options={GRADE_OPTIONS} value={gradeTag} onChange={setGradeTag} />
            <TagDropdown label="Tài liệu ôn thi" options={EXAM_OPTIONS} value={examTag} onChange={setExamTag} />
            {hasFilter ? (
              <button type="button" onClick={resetFilters} className="w-full rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:w-auto">
                Xóa bộ lọc
              </button>
            ) : null}
          </div>
        </div>

        {/* Gợi ý tìm kiếm nhanh */}
        <aside className="mb-7 flex flex-wrap items-center gap-2 rounded-2xl bg-sky-50 px-5 py-4 text-sm text-sky-800">
          <span className="font-semibold">Gợi ý tìm kiếm:</span>
          {["Toán", "lập trình", "ôn tập"].map((s) => (
            <button key={s} className="rounded-full bg-white px-3 py-1.5 text-sky-700 shadow-sm" onClick={() => setQ(s)} type="button">
              {s}
            </button>
          ))}
        </aside>

        {/* Lỗi API / lưới thẻ / empty state */}
        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
              <AlertTriangle />
            </div>
            <h2 className="font-display mt-5 text-[24px] font-bold text-slate-800">Không tải được tài liệu</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-500">{error}</p>
            <button onClick={() => load([gradeTag, examTag].filter(Boolean))} className="mt-6 rounded-xl px-5 py-3 font-semibold text-white hover:brightness-95" style={{ background: "#4f9fd1" }} type="button">
              Thử lại
            </button>
          </section>
        ) : loading && docs.length === 0 ? (
          <p className="rounded-xl border bg-white p-8 text-center text-slate-500">Đang tải danh sách tài liệu...</p>
        ) : results.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
              <SearchX />
            </div>
            <h2 className="font-display mt-5 text-[24px] font-bold text-slate-800">Chưa tìm thấy tài liệu phù hợp</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-500">Hãy thử thay đổi từ khóa hoặc xóa bộ lọc để khám phá thêm tài liệu.</p>
            <button onClick={resetFilters} className="mt-6 rounded-xl px-5 py-3 font-semibold text-white hover:brightness-95" style={{ background: "#4f9fd1" }} type="button">
              Đặt lại bộ lọc
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((doc) => <StudyDocCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </section>

      <StudyToast message={toast} />
    </main>
  );
}
