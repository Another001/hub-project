// Dropdown lọc theo tag Cloudinary, dùng chung cho các filter.
// Props: label hiện trên nút, options là các {label hiển thị, tag gọi API},
// value là tag đang chọn ("" = Tất cả), onChange(tagMoi) báo lên cha để gọi lại API.
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { TagOption } from "@/lib/list-documents";

type Props = {
  label: string; // vd: "Lớp", "Tài liệu ôn thi"
  options: TagOption[];
  value: string;
  onChange: (tag: string) => void;
};

export default function TagDropdown({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false); // panel đang mở hay đóng
  const rootRef = useRef<HTMLDivElement>(null);

  // Bấm ra ngoài hoặc Esc thì đóng panel.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  // Tên hiển thị trên nút: giá trị đang chọn, hoặc "Tất cả {label}".
  const current = options.find((o) => o.tag === value);

  const pick = (tag: string) => {
    onChange(tag);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-sky-300 sm:w-auto sm:min-w-44"
      >
        <span className="truncate">
          <span className="text-slate-400">{label}: </span>
          <span className="font-semibold text-slate-700">{current ? current.label : "Tất cả"}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-sky-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <ul className="absolute z-20 mt-2 max-h-64 w-full min-w-44 overflow-auto rounded-xl border border-sky-100 bg-white p-1.5 shadow-xl sm:w-auto">
          {/* Mục đầu: bỏ lọc */}
          <li>
            <button
              type="button"
              onClick={() => pick("")}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-sky-50"
            >
              <span>Tất cả {label.toLowerCase()}</span>
              {!value ? <Check className="h-4 w-4 text-sky-600" /> : null}
            </button>
          </li>
          {options.map((o) => (
            <li key={o.tag}>
              <button
                type="button"
                onClick={() => pick(o.tag)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-sky-50"
              >
                <span>{o.label}</span>
                {value === o.tag ? <Check className="h-4 w-4 text-sky-600" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
