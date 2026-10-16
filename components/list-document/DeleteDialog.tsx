// Modal xác nhận xóa file (dùng chung list + chi tiết).
// Giao diện .lv-dialog theo mẫu. Cha xử lý gọi API + unlock + toast.
"use client";

import { Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  fileName: string; // tên file hiện để user kiểm tra trước khi xóa
  loading: boolean; // đang gọi API xóa
  error: string; // lỗi xóa (rỗng = không lỗi)
  onClose: () => void;
  onConfirm: () => void; // user bấm "Xóa vĩnh viễn"
};

export default function DeleteDialog({ open, fileName, loading, error, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="lv-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Xác nhận xóa tài liệu">
      <div className="lv-dialog">
        <div className="lv-dialog-head">
          <span className="lv-dialog-icon" aria-hidden="true" style={{ background: "#fef2f2", color: "#dc2626" }}>
            <Trash2 className="icon" />
          </span>
          <h2>Xóa tài liệu?</h2>
        </div>
        <p className="lv-dialog-sub">
          File “{fileName}” sẽ bị xóa vĩnh viễn khỏi thư viện và không thể khôi phục.
        </p>
        {error ? <p className="lv-error" role="alert">{error}</p> : null}
        <div className="buttons">
          <button className="outline" type="button" onClick={onClose} disabled={loading}>Hủy</button>
          <button
            className="primary"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: "#dc2626" }}
          >
            {loading ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
}
