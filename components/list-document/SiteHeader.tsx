// Header chung của cụm list-document, đúng mẫu StudyShelf:
// logo + tên bên trái, 2 nút Tài liệu / Giới thiệu bên phải.
"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SiteHeader({ onAbout }: { onAbout: () => void }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-4">
        {/* Click logo -> về danh sách */}
        <button type="button" onClick={() => router.push("/list-document")} className="flex min-w-0 items-center gap-2 text-left sm:gap-3" aria-label="Về danh sách tài liệu">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 sm:h-10 sm:w-10">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="truncate text-[18px] font-bold tracking-tight sm:text-[20px]" style={{ color: "#16324a" }}>
            StudyShelf
          </span>
        </button>
        <nav aria-label="Điều hướng chính" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => router.push("/list-document")}
            className="rounded-lg bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-800 sm:px-4"
          >
            Tài liệu
          </button>
          <button
            type="button"
            onClick={onAbout}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 sm:px-4"
          >
            Giới thiệu
          </button>
        </nav>
      </div>
    </header>
  );
}
