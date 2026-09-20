// Header chung của cụm list-document, đúng mẫu StudyShelf:
// logo + tên bên trái, 2 nút Tài liệu / Giới thiệu bên phải.
"use client";

import { BookOpen, KeyRound, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  unlocked?: boolean; // đã nhập mã chưa
  checking?: boolean; // đang hỏi /api/auth/status
  onUnlockClick?: () => void;
  onLogout?: () => void;
};

export default function SiteHeader({ unlocked, checking, onUnlockClick, onLogout }: Props) {
  const router = useRouter();
  const showAuth = onUnlockClick || onLogout;
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-4">
        {/* Click logo -> về danh sách */}
        <button type="button" onClick={() => router.push("/list-document")} className="flex min-w-0 items-center gap-2 text-left sm:gap-3" aria-label="Về danh sách tài liệu">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 sm:h-10 sm:w-10">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="truncate text-[18px] font-bold tracking-tight sm:text-[20px]" style={{ color: "#16324a" }}>
            Math Hub
          </span>
        </button>
        <div aria-label="Điều hướng chính" className="flex shrink-0 items-center gap-1 sm:gap-2">
          {showAuth ? (
            checking ? (
              <span className="px-3 py-2 text-xs font-medium text-slate-400">Đang kiểm tra...</span>
            ) : unlocked ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                title="Đã mở khóa tải lên — bấm để thoát"
              >
                <span className="hidden sm:inline">Đã mở khóa</span>
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onUnlockClick}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">Nhập mã</span>
              </button>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
