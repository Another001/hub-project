// Thanh tìm kiếm + bộ lọc Môn / Lớp / Sắp xếp cho màn danh sách.
// Component "câm": chỉ hiển thị và báo thay đổi lên cha qua onChange.
"use client";

export type FilterState = {
  q: string; // từ khóa tìm kiếm
  subject: string; // "all" hoặc tên môn
  grade: string; // "all" hoặc Lớp
  sort: string; // "newest" | "name" | "downloads"
};

type Props = {
  value: FilterState;
  onChange: (v: FilterState) => void;
  subjects: string[]; // danh sách môn lấy từ dữ liệu
  grades: string[]; // danh sách lớp lấy từ dữ liệu
};

export default function DocumentFilters({ value, onChange, subjects, grades }: Props) {
  // Hàm tiện ích: đổi 1 field, giữ nguyên các field còn lại.
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
      {/* Ô tìm kiếm theo tên/mô tả */}
      <input
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder="Tìm kiếm tài liệu..."
        className="rounded-lg border px-3 py-2 outline-none focus:border-blue-500 md:col-span-2"
      />
      {/* Lọc theo môn */}
      <select
        value={value.subject}
        onChange={(e) => set({ subject: e.target.value })}
        className="rounded-lg border px-3 py-2"
      >
        <option value="all">Tất cả môn</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {/* Lọc theo lớp + sắp xếp gộp chung 1 cột cho gọn */}
      <div className="flex gap-2">
        <select
          value={value.grade}
          onChange={(e) => set({ grade: e.target.value })}
          className="w-1/2 rounded-lg border px-2 py-2"
        >
          <option value="all">Mọi lớp</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={value.sort}
          onChange={(e) => set({ sort: e.target.value })}
          className="w-1/2 rounded-lg border px-2 py-2"
        >
          <option value="newest">Mới nhất</option>
          <option value="name">Tên A-Z</option>
          <option value="downloads">Tải nhiều</option>
        </select>
      </div>
    </div>
  );
}
