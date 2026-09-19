// MÀN 2: Chi tiết tài liệu (/tai-lieu/[id])
// Chức năng: xem thông tin + preview PDF (react-pdf) + tải xuống + tài liệu liên quan.
// id trên URL chính là doc.id trong danh sách (public_id encode hoặc id JSON local).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PdfViewer from "@/components/documents/PdfViewer";
import DocumentCard from "@/components/documents/DocumentCard";
import { formatSize, getDocuments, toDownloadUrl, type Document } from "@/lib/documents";

export default function TaiLieuDetailPage({ params }: { params: { id: string } }) {
  const decodedId = decodeURIComponent(params.id); // Next 14: params là object thường

  const [doc, setDoc] = useState<Document | null>(null);
  const [related, setRelated] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải danh sách rồi tìm đúng id (vì không có BE, tìm client-side).
  useEffect(() => {
    getDocuments().then(({ docs }) => {
      const found = docs.find((d) => d.id === decodedId) ?? null;
      setDoc(found);
      // Gợi ý: cùng môn, khác chính nó, tối đa 3 cái.
      if (found) setRelated(docs.filter((d) => d.subject === found.subject && d.id !== found.id).slice(0, 3));
      setLoading(false);
    });
  }, [decodedId]);

  if (loading) return <main className="mx-auto max-w-6xl p-8 text-gray-500">Đang tải...</main>;
  if (!doc)
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-8">
        <p className="font-semibold text-red-600">Không tìm thấy tài liệu.</p>
        <Link href="/tai-lieu" className="text-blue-600 underline">← Về danh sách</Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      {/* Quay lại */}
      <Link href="/tai-lieu" className="text-sm text-blue-600 hover:underline">← Về danh sách</Link>

      {/* Tiêu đề + nút tải */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <p className="text-sm text-gray-500">
            {doc.subject} • {doc.grade} • {formatSize(doc.size)} • Ngày đăng {doc.uploadedAt} • {doc.downloads} lượt tải
          </p>
        </div>
        <div className="flex gap-2">
          {/* Nút tải: thêm fl_attachment để ép download (xem toDownloadUrl) */}
          <a href={toDownloadUrl(doc.fileUrl)} download className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            ⬇ Tải xuống
          </a>
          <a href={doc.fileUrl} target="_blank" className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50">
            Mở tab mới
          </a>
        </div>
      </div>

      {/* 2 cột: preview PDF + thông tin */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PdfViewer fileUrl={doc.fileUrl} />
        </div>
        <aside className="h-fit space-y-3 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Thông tin tài liệu</h2>
          <p className="text-sm text-gray-600">{doc.description || "Chưa có mô tả."}</p>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Người đăng</dt><dd>{doc.uploader}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Dung lượng</dt><dd>{formatSize(doc.size)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Định dạng</dt><dd>PDF</dd></div>
          </dl>
          {/* Hiện link gốc để bạn đối chiếu với Secure URL trên Cloudinary */}
          <p className="break-all text-xs text-gray-400">{doc.fileUrl}</p>
        </aside>
      </div>

      {/* Tài liệu liên quan */}
      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Tài liệu liên quan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((d) => (
              <DocumentCard key={d.id} doc={d} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
