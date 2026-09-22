// Modal upload PDF (tối đa 4MB do giới hạn Vercel) + metadata đầy đủ.
// Giao diện theo mẫu thu-vien-toan.html (.lv-dialog). Logic giữ nguyên:
// validate .pdf + 4MB, FormData title/grade/type/tags, 401 -> báo cha mở unlock.
"use client";

import { useMemo, useState } from "react";
import { FileUp } from "lucide-react";
import { EXAM_OPTIONS, GRADE_OPTIONS } from "@/lib/list-documents";

type Props = {
  open: boolean;
  onClose: () => void;
  onNeedUnlock: () => void; // server trả 401 -> cha mở UnlockDialog
  onUploaded: (id: string) => void; // upload xong -> cha reload list
};

const MAX_MB = 4;

export default function UploadDialog({ open, onClose, onNeedUnlock, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [gradeTag, setGradeTag] = useState("");
  const [examTag, setExamTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examOpts = useMemo(() => EXAM_OPTIONS.filter((o) => o.tag !== "video-bai-giang"), []);

  if (!open) return null;

  const pickFile = (f: File | null) => {
    setError("");
    if (!f) {
      setFile(null);
      return;
    }
    if (!/\.pdf$/i.test(f.name)) {
      setError("Chỉ cho phép file .pdf.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File vượt quá ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").slice(0, 200));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title.trim());
      const gradeLabel = GRADE_OPTIONS.find((o) => o.tag === gradeTag)?.label ?? "";
      const typeLabel = examOpts.find((o) => o.tag === examTag)?.label ?? "";
      if (gradeLabel) fd.append("grade", gradeLabel);
      if (typeLabel) fd.append("type", typeLabel);
      if (gradeTag) fd.append("tags", gradeTag);
      if (examTag) fd.append("tags", examTag);

      const r = await fetch("/api/documents/upload", { method: "POST", body: fd });
      const j = (await r.json().catch(() => ({}))) as { error?: string; id?: string };
      if (r.status === 401) {
        onNeedUnlock(); // hết hạn/chưa unlock -> nhập mã rồi upload lại
        return;
      }
      if (r.status === 413) {
        setError(`File quá lớn cho server (giới hạn ${MAX_MB}MB). Hãy nén/giảm dung lượng PDF rồi thử lại.`);
        return;
      }
      if (!r.ok) {
        setError(j.error || "Upload thất bại. Thử lại.");
        return;
      }
      const id = String(j.id || "");
      // Reset form
      setFile(null);
      setTitle("");
      setGradeTag("");
      setExamTag("");
      onClose();
      onUploaded(id);
    } catch {
      setError("Không kết nối được server. Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lv-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Tải lên tài liệu PDF">
      <form className="lv-dialog" onSubmit={submit}>
        <div className="lv-dialog-head">
          <span className="lv-dialog-icon" aria-hidden="true">
            <FileUp className="icon" />
          </span>
          <h2>Tải lên tài liệu PDF</h2>
        </div>
        <p className="lv-dialog-sub">Tối đa {MAX_MB}MB, chỉ nhận file PDF.</p>

        <label>
          Tệp PDF
          <input
            className="lv-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file ? (
          <p className="lv-dialog-sub">{file.name} • {(file.size / 1024 / 1024).toFixed(2)}MB</p>
        ) : null}

        <label>
          Tên tài liệu
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Nhập tên tài liệu"
          />
        </label>

        <label>
          Khối lớp
          <select value={gradeTag} onChange={(e) => setGradeTag(e.target.value)}>
            <option value="">-- Chọn lớp --</option>
            {GRADE_OPTIONS.map((o) => (
              <option key={o.tag} value={o.tag}>{o.label}</option>
            ))}
          </select>
        </label>

        <label>
          Loại tài liệu
          <select value={examTag} onChange={(e) => setExamTag(e.target.value)}>
            <option value="">-- Chọn loại --</option>
            {examOpts.map((o) => (
              <option key={o.tag} value={o.tag}>{o.label}</option>
            ))}
          </select>
        </label>

        {error ? <p className="lv-error" role="alert">{error}</p> : null}

        <div className="buttons">
          <button className="outline" type="button" onClick={onClose}>Hủy</button>
          <button className="primary" type="submit" disabled={loading || !file || !title.trim()}>
            {loading ? "Đang tải lên..." : "Thêm tài liệu"}
          </button>
        </div>
      </form>
    </div>
  );
}
