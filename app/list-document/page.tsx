// MÀN 1: /list-document — Danh sách tài liệu đúng mẫu StudyShelf.
// Gồm: header, hero (badge + tiêu đề + mô tả + ô tìm kiếm + 3 thẻ thống kê),
// khối Khám phá (bộ lọc môn/lớp/loại + gợi ý tìm kiếm + lưới thẻ + empty state), toast.
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import SiteHeader from "@/components/list-document/SiteHeader";
import StudyDocCard from "@/components/list-document/StudyDocCard";
import StudyToast from "@/components/list-document/StudyToast";
import { listDocuments } from "@/lib/cloudinary-actions"; // Server Action: list thật từ Cloudinary (secret ở server)
import {
  filterListDocuments,
  getListDocuments, // fallback: dữ liệu mẫu local khi chưa có key Cloudinary
  uniqueValues,
  type ListDocument,
} from "@/lib/list-documents";

export default function ListDocumentPage() {
  const [docs, setDocs] = useState<ListDocument[]>([]); // toàn bộ tài liệu
  const [source, setSource] = useState<"cloudinary" | "local">("local"); // đang dùng nguồn nào (để debug)
  const [q, setQ] = useState(""); // từ khóa tìm kiếm
  const [subject, setSubject] = useState(""); // lọc môn ("": tất cả)
  const [grade, setGrade] = useState(""); // lọc khối/lớp
  const [type, setType] = useState(""); // lọc loại tài liệu
  const [toast, setToast] = useState(""); // thông báo góc phải dưới
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Nạp danh sách 1 lần: thử Cloudinary server-side trước,
  // lỗi (chưa điền key, chưa bật tag...) thì dùng dữ liệu mẫu local.
  useEffect(() => {
    console.log("gọi thử api")
    listDocuments({})
      .then(({ docs }) => {
        setDocs(docs);
        setSource("cloudinary");
      })
      .catch(() => {
        getListDocuments().then((d) => {
          setDocs(d);
          setSource("local");
        });
      });
  }, []);

  console.log(docs)

  // Hiện toast 3.2s rồi tự ẩn (đúng mẫu HTML).
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    setToastTimer(setTimeout(() => setToast(""), 3200));
  };

  // Danh sách giá trị cho 3 ô select, tự suy ra từ dữ liệu.
  const subjects = useMemo(() => uniqueValues(docs, "subject"), [docs]);
  const grades = useMemo(() => uniqueValues(docs, "grade"), [docs]);
  const types = useMemo(() => uniqueValues(docs, "type"), [docs]);

  // Lọc client-side mỗi khi đổi tìm kiếm/bộ lọc.
  const results = useMemo(
    () => filterListDocuments(docs, { q, subject, grade, type }),
    [docs, q, subject, grade, type]
  );
  const hasFilter = q || subject || grade || type;

  // Xóa hết bộ lọc (nút Xóa bộ lọc + nút trong empty state).
  const resetFilters = () => {
    setQ(""); setSubject(""); setGrade(""); setType("");
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
            <h1 className="font-display mt-5 text-[32px] font-bold tracking-tight text-slate-800">
              Tài liệu học tập
            </h1>
            <p className="mt-4 max-w-2xl text-[18px] leading-7 text-slate-600">
              Nơi lưu trữ và tra cứu tài liệu PDF hữu ích cho hành trình học tập của bạn.
            </p>
          </div>
          {/* Ô tìm kiếm: submit cũng lọc (input đã lọc live) */}
          <form
            className="soft-card mt-8 flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-3"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
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
            <button className="rounded-xl px-5 py-2.5 font-semibold text-white transition hover:brightness-95" style={{ background: "#4f9fd1" }} type="submit">
              Tìm kiếm
            </button>
          </form>
          {/* 3 thẻ thống kê tính từ dữ liệu thật */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">{docs.length}+ tài liệu chọn lọc</div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">{subjects.length} môn học đa dạng</div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-600">Cập nhật mỗi tuần</div>
          </div>
        </div>
      </section>

      {/* Khám phá: bộ lọc + gợi ý + lưới thẻ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-[24px] font-bold text-slate-800">Khám phá tài liệu</h2>
            <p className="mt-1 text-sm text-slate-500" aria-live="polite">
              Hiển thị {results.length} / {docs.length} tài liệu • Nguồn: {source === "cloudinary" ? "Cloudinary (tag tai-lieu)" : "File mẫu local"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm" aria-label="Môn học">
              <option value="">Tất cả môn học</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm" aria-label="Khối hoặc lớp">
              <option value="">Tất cả khối/lớp</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm" aria-label="Loại tài liệu">
              <option value="">Tất cả loại tài liệu</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {hasFilter ? (
              <button type="button" onClick={resetFilters} className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
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

        {/* Lưới thẻ hoặc empty state */}
        {results.length === 0 ? (
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
