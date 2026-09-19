// Thẻ tài liệu đúng mẫu StudyShelf:
// icon PDF + badge loại, dòng môn·lớp, tiêu đề, mô tả, meta trang/dung lượng/ngày, nút Xem chi tiết.
// Click bất kỳ nút nào trên thẻ đều sang màn chi tiết /list-document/[id].
"use client";

import { ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ListDocument } from "@/lib/list-documents";

export default function StudyDocCard({ doc }: { doc: ListDocument }) {
  const router = useRouter();
  const open = () => router.push(`/list-document/${doc.id}`);

  return (
    <article className="doc-card soft-card flex h-full flex-col rounded-2xl bg-white p-5">
      haha
      <button className="flex flex-1 flex-col text-left" type="button" onClick={open}>
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <FileText className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            {doc.type}
          </span>
        </div>
        <p className="mt-5 text-sm font-semibold text-sky-700">
          {doc.subject} · {doc.grade}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-slate-800">{doc.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{doc.description}</p>
      </button>
      <div className="mt-5 border-t border-sky-50 pt-4 text-xs text-slate-500">
        {doc.pageCount} trang • {doc.fileSize} • Cập nhật {doc.uploadedAt}
      </div>
      <button
        onClick={open}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        type="button"
      >
        <span>Xem chi tiết</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}
