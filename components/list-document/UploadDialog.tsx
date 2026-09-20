// Modal upload PDF (tối đa 10MB) + metadata đầy đủ.
// 401 từ server -> báo lên cha để mở modal nhập mã.
"use client";

import { useMemo, useState } from "react";
import { FileUp, X } from "lucide-react";
import { EXAM_OPTIONS, GRADE_OPTIONS } from "@/lib/list-documents";

type Props = {
  open: boolean;
  onClose: () => void;
  onNeedUnlock: () => void; // server trả 401 -> cha mở UnlockDialog
  onUploaded: (id: string) => void; // upload xong -> cha reload list
};

const MAX_MB = 10;

export default function UploadDialog({ open, onClose, onNeedUnlock, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Toán");
  const [gradeTag, setGradeTag] = useState("");
  const [examTag, setExamTag] = useState("");
  const [description, setDescription] = useState("");
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
      fd.append("subject", subject.trim() || "Chưa phân loại");
      const gradeLabel = GRADE_OPTIONS.find((o) => o.tag === gradeTag)?.label ?? "";
      const typeLabel = examOpts.find((o) => o.tag === examTag)?.label ?? "";
      if (gradeLabel) fd.append("grade", gradeLabel);
      if (typeLabel) fd.append("type", typeLabel);
      if (description.trim()) fd.append("description", description.trim());
      if (gradeTag) fd.append("tags", gradeTag);
      if (examTag) fd.append("tags", examTag);

      const r = await fetch("/api/documents/upload", { method: "POST", body: fd });
      const j = (await r.json().catch(() => ({}))) as { error?: string; id?: string };
      if (r.status === 401) {
        onNeedUnlock(); // hết hạn/chưa unlock -> nhập mã rồi upload lại
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
      setDescription("");
      onClose();
      onUploaded(id);
    } catch {
      setError("Không kết nối được server. Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="Tải lên tài liệu PDF">
      <div className="soft-card max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <FileUp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tải lên tài liệu PDF</h2>
              <p className="text-sm text-slate-500">Tối đa {MAX_MB}MB, chỉ nhận file PDF thật.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" type="button" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600" htmlFor="upload-file">File PDF</label>
            <input
              id="upload-file"
              type="file"
              accept=".pdf,application/pdf"
              className="mt-2 w-full rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-3 text-sm text-slate-600"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="mt-1 text-xs text-slate-500">{file.name} • {(file.size / 1024 / 1024).toFixed(2)}MB</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600" htmlFor="upload-title">Tiêu đề *</label>
            <input
              id="upload-title"
              className="mt-2 w-full rounded-xl border border-sky-200 px-4 py-2.5 text-slate-700 outline-none focus:border-sky-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="VD: Toán 9 - Đề giữa kì số 1"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-600" htmlFor="upload-grade">Lớp</label>
              <select id="upload-grade" className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700" value={gradeTag} onChange={(e) => setGradeTag(e.target.value)}>
                <option value="">-- Chọn lớp --</option>
                {GRADE_OPTIONS.map((o) => (
                  <option key={o.tag} value={o.tag}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600" htmlFor="upload-type">Loại</label>
              <select id="upload-type" className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm text-slate-700" value={examTag} onChange={(e) => setExamTag(e.target.value)}>
                <option value="">-- Chọn loại --</option>
                {examOpts.map((o) => (
                  <option key={o.tag} value={o.tag}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600" htmlFor="upload-subject">Môn học</label>
            <input
              id="upload-subject"
              className="mt-2 w-full rounded-xl border border-sky-200 px-4 py-2.5 text-slate-700 outline-none focus:border-sky-400"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              placeholder="VD: Toán"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600" htmlFor="upload-desc">Mô tả</label>
            <textarea
              id="upload-desc"
              className="mt-2 w-full rounded-xl border border-sky-200 px-4 py-2.5 text-slate-700 outline-none focus:border-sky-400"
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về tài liệu..."
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-600" role="alert">{error}</p> : null}

          <button
            disabled={loading || !file || !title.trim()}
            className="w-full rounded-xl px-5 py-2.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            style={{ background: "#4f9fd1" }}
            type="submit"
          >
            {loading ? "Đang tải lên..." : "Tải lên"}
          </button>
        </form>
      </div>
    </div>
  );
}
