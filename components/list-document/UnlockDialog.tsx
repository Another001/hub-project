// Modal nhập mã truy cập -> POST /api/auth/unlock -> nhận cookie httpOnly.
// Giao diện theo mẫu thu-vien-toan.html (.lv-dialog). Logic giữ nguyên:
// sai mã hiện lỗi, nhiều lần sai hiện đếm ngược rate-limit từ server.
"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

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
    <div className="lv-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Đăng nhập">
      <form className="lv-dialog" onSubmit={submit}>
        <div className="lv-dialog-head">
          <span className="lv-dialog-icon" aria-hidden="true">
            <KeyRound className="icon" />
          </span>
          <h2>Đăng nhập</h2>
        </div>
        <p className="lv-dialog-sub">Nhập mã truy cập để mở khóa tải lên tài liệu.</p>
        <label>
          Mã truy cập
          <input
            type="password"
            autoComplete="off"
            autoFocus
            placeholder="Nhập mã..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {error ? <p className="lv-error" role="alert">{error}</p> : null}
        <div className="buttons">
          <button className="outline" type="button" onClick={onClose}>Hủy</button>
          <button className="primary" type="submit" disabled={loading || !code.trim()}>
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </div>
      </form>
    </div>
  );
}
