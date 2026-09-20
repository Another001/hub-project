// Modal nhập mã truy cập -> POST /api/auth/unlock -> nhận cookie httpOnly.
// Sai mã hiện lỗi chung, nhập sai nhiều lần hiện đếm ngược rate-limit.
"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void; // gọi refresh auth + mở tiếp upload nếu cần
};

export default function UnlockDialog({ open, onClose, onUnlocked }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setError(j.error || "Mã truy cập không đúng.");
        return;
      }
      setCode("");
      onUnlocked();
      onClose();
    } catch {
      setError("Không kết nối được server. Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="Nhập mã truy cập">
      <div className="soft-card w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Nhập mã truy cập</h2>
              <p className="text-sm text-slate-500">Nhập đúng mã để mở khóa tải lên tài liệu.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" type="button" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5">
          <label htmlFor="access-code" className="text-sm font-semibold text-slate-600">Mã số</label>
          <input
            id="access-code"
            type="password"
            autoComplete="off"
            autoFocus
            className="mt-2 w-full rounded-xl border border-sky-200 px-4 py-2.5 text-slate-700 outline-none focus:border-sky-400"
            placeholder="Nhập mã..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error ? <p className="mt-2 text-sm font-medium text-red-600" role="alert">{error}</p> : null}
          <button
            disabled={loading || !code.trim()}
            className="mt-4 w-full rounded-xl px-5 py-2.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            style={{ background: "#4f9fd1" }}
            type="submit"
          >
            {loading ? "Đang kiểm tra..." : "Mở khóa"}
          </button>
        </form>
      </div>
    </div>
  );
}
