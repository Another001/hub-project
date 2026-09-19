// MÀN 1: Danh sách tài liệu (/tai-lieu)
// Chức năng: tìm kiếm + lọc môn/lớp + sắp xếp + phân trang (tất cả client-side).
// Nguồn dữ liệu: getDocuments() thử Cloudinary tag "tai-lieu" trước, lỗi thì dùng data/documents.json.
"use client";

import { useEffect, useMemo, useState } from "react";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentFilters, { type FilterState } from "@/components/documents/DocumentFilters";
import DocumentPagination from "@/components/documents/DocumentPagination";
import { filterDocuments, getDocuments, paginate, type Document } from "@/lib/documents";

const PER_PAGE = 6; // số thẻ mỗi trang

export default function TaiLieuPage() {
  const [docs, setDocs] = useState<Document[]>([]); // toàn bộ tài liệu
  const [source, setSource] = useState<"cloudinary" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ q: "", subject: "all", grade: "all", sort: "newest" });

  // Tải danh sách 1 lần khi mở trang.
  useEffect(() => {
    getDocuments().then(({ docs, source }) => {
      setDocs(docs);
      setSource(source);
      setLoading(false);
    });
  }, []);

  // Reset về trang 1 mỗi khi đổi filter.
  const onFilterChange = (v: FilterState) => {
    setFilters(v);
    setPage(1);
  };

  // Danh sách môn/lớp tự suy ra từ dữ liệu (khỏi hardcode).
  const subjects = useMemo(() => Array.from(new Set(docs.map((d) => d.subject))), [docs]);
  const grades = useMemo(() => Array.from(new Set(docs.map((d) => d.grade))), [docs]);

  // Lọc rồi mới phân trang.
  const filtered = useMemo(() => filterDocuments(docs, filters), [docs, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = paginate(filtered, page, PER_PAGE);

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      {/* Tiêu đề + nguồn dữ liệu để bạn debug */}
      <div>
        <h1 className="text-2xl font-bold">Thư viện tài liệu PDF</h1>
        <p className="text-sm text-gray-500">
          {loading ? "Đang tải..." : `${filtered.length} tài liệu • Nguồn: ${source === "cloudinary" ? "Cloudinary (tag tai-lieu)" : "File mẫu local"}`}
        </p>
      </div>

      {/* Bộ lọc */}
      <DocumentFilters value={filters} onChange={onFilterChange} subjects={subjects} grades={grades} />

      {/* Lưới thẻ */}
      {loading ? (
        <p className="text-gray-500">Đang tải danh sách...</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Không tìm thấy tài liệu. Thử đổi từ khóa hoặc bộ lọc.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      )}

      {/* Phân trang */}
      <DocumentPagination page={page} totalPages={totalPages} onChange={setPage} />
    </main>
  );
}
