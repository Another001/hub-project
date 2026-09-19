// Toast báo thao tác (copy đúng mẫu: góc phải dưới, nền slate-800).
// Cha truyền message, rỗng = ẩn. Tự hiện class toast-show khi có message.
"use client";

import { CheckCircle } from "lucide-react";

export default function StudyToast({ message }: { message: string }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex translate-y-4 items-center gap-3 rounded-2xl bg-slate-800 px-5 py-4 text-sm font-medium text-white opacity-0 shadow-2xl transition-all ${message ? "toast-show" : ""}`}
      role="status"
      aria-live="polite"
    >
      <CheckCircle className="h-5 w-5 text-sky-300" />
      <span>{message}</span>
    </div>
  );
}
