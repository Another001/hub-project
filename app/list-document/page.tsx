// MÀN 1: /list-document — Danh sách tài liệu, giao diện theo mẫu thu-vien-toan.html.
// Logic giữ nguyên 100%: Cloudinary qua Server Action, lọc text + tag Lớp/Loại,
// nhánh Video YouTube tĩnh, upload/unlock/auth, loading/error/empty, toast.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, FileUp, Search, SearchX } from "lucide-react";
import SiteHeader from "@/components/list-document/SiteHeader";
import StudyDocCard from "@/components/list-document/StudyDocCard";
import StudyVideoCard from "@/components/list-document/StudyVideoCard";
import StudyToast from "@/components/list-document/StudyToast";
import UnlockDialog from "@/components/list-document/UnlockDialog";
import UploadDialog from "@/components/list-document/UploadDialog";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { listDocuments } from "@/lib/cloudinary-actions"; // Server Action: list thật từ Cloudinary (secret ở server)
import {
  EXAM_OPTIONS,
  GRADE_OPTIONS,
  VIDEO_TAG,
  filterListDocuments,
  type ListDocument,
} from "@/lib/list-documents";
import { DEMO_VIDEOS, filterListVideos } from "@/lib/list-videos";

export default function ListDocumentPage() {
  const [docs, setDocs] = useState<ListDocument[]>([]); // kết quả từ API theo tag đang chọn
  const [loading, setLoading] = useState(true); // đang gọi API
  const [error, setError] = useState(""); // lỗi gọi API (trống = không lỗi)
  const [q, setQ] = useState(""); // từ khóa tìm kiếm (lọc client-side)
  const [gradeTag, setGradeTag] = useState(""); // tag lớp: "" | lop-6..lop-9 (chip)
  const [examTag, setExamTag] = useState(""); // tag loại: "" | de-thi/de-cuong/.../video (select)
  const [showUnlock, setShowUnlock] = useState(false); // modal nhập mã
  const [showUpload, setShowUpload] = useState(false); // modal upload PDF
  const [reopenUpload, setReopenUpload] = useState(false); // 401 giữa chừng -> unlock xong mở lại upload
  const [toast, setToast] = useState(""); // thông báo sau upload
  const { unlocked, checking, refresh, logout } = useAuthStatus();

  // Nhánh đặc biệt: Loại = Video bài giảng -> dùng nguồn tĩnh YouTube, KHÔNG gọi Cloudinary.
  const isVideoMode = examTag === VIDEO_TAG;

  // Gọi API theo tag đang chọn (rỗng hết = đường all, chỉ lấy PDF).
  const load = useCallback((tags: string[]) => {
    setLoading(true);
    setError("");
    listDocuments({ tags })
      .then(({ docs }) => setDocs(docs))
      .catch(() => setError("Không tải được danh sách tài liệu. Kiểm tra mạng hoặc cấu hình Cloudinary rồi thử lại."))
      .finally(() => setLoading(false));
  }, []);

  // Đổi chip/select nào là gọi lại API với bộ tag mới.
  // Video mode thì bỏ qua Cloudinary (nguồn tĩnh), xóa lỗi/loading cũ.
  useEffect(() => {
    if (isVideoMode) {
      setLoading(false);
      setError("");
      return;
    }
    load([gradeTag, examTag].filter(Boolean));
  }, [gradeTag, examTag, isVideoMode, load]);

  // Lọc văn bản client-side trên kết quả API đã trả về.
  // Video mode lọc trên nguồn tĩnh DEMO_VIDEOS (không dùng gradeTag).
  const results = useMemo(() => filterListDocuments(docs, q), [docs, q]);
  const videoResults = useMemo(() => filterListVideos(DEMO_VIDEOS, q), [q]);
  const hasFilter = q || gradeTag || examTag;

  // Xóa hết bộ lọc (nút Xóa bộ lọc + nút trong empty state).
  const resetFilters = () => {
    setQ(""); setGradeTag(""); setExamTag("");
  };

  // Bấm "Tải lên PDF": chưa unlock -> mở modal nhập mã trước.
  const openUpload = () => {
    if (!unlocked) {
      setReopenUpload(true);
      setShowUnlock(true);
      return;
    }
    setShowUpload(true);
  };

  // Upload xong -> tải lại list theo tag đang chọn + toast.
  const handleUploaded = () => {
    load([gradeTag, examTag].filter(Boolean));
    setToast("Tải lên thành công.");
    setTimeout(() => setToast(""), 3200);
  };

  return (
    <main className="fade-in">
      <SiteHeader unlocked={unlocked} checking={checking} onUnlockClick={() => setShowUnlock(true)} onLogout={logout} />

      {/* Hero theo mẫu: eyebrow + H1 + intro + ô tìm kiếm pill */}
      <section className="hero">
        <div className="lv-container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">THƯ VIỆN SỐ</p>
            <h1 className="lv-h1">Tri thức mở.<br />Khơi nguồn sáng tạo.</h1>
            <p className="intro">Khám phá tài liệu môn Toán của Trường THCS Lê Văn Tám.</p>
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
              <Search className="icon" aria-hidden="true" />
              <label htmlFor="document-search" className="sr-only">Tìm kiếm tài liệu</label>
              <input
                id="document-search"
                type="search"
                placeholder={isVideoMode ? "Tìm kiếm video, môn học..." : "Tìm kiếm tài liệu..."}
                aria-label="Tìm kiếm tài liệu"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button aria-label="Tìm kiếm" type="submit">
                <ArrowRight className="icon" aria-hidden="true" />
              </button>
            </form>
          </div>
          {/* Ảnh minh họa toán học (file bạn xuất lại trong public/) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-art" src="/hero-illustration.png" alt="Minh họa toán học với compa, ê-ke và sách" />
        </div>
      </section>

      {/* Khối library theo mẫu: section-top + filters + lưới thẻ */}
      <section className="lv-container library" aria-labelledby="library-title">
        <div className="section-top">
          <div>
            <h2 className="lv-h2" id="library-title">
              {isVideoMode ? "Video bài giảng." : "Tài liệu dành cho bạn."}
            </h2>
            <p className="count-note" aria-live="polite">
              {isVideoMode
                ? `Hiển thị ${videoResults.length} / ${DEMO_VIDEOS.length} video`
                : loading ? "Đang tải..." : `Hiển thị ${results.length} / ${docs.length} tài liệu`}
            </p>
          </div>
          <button className="primary" type="button" onClick={openUpload}>
            <FileUp className="icon" aria-hidden="true" />
            Tải lên PDF
          </button>
        </div>

        <div className="filters">
          {/* Chip lớp theo mẫu (thay cho dropdown Lớp cũ, cùng giá trị tag) */}
          {isVideoMode ? (
            <p className="video-note">Video lấy từ YouTube — lọc theo ô tìm kiếm, không theo Lớp.</p>
          ) : (
            <div className="grades" role="group" aria-label="Lọc theo lớp">
              <button
                type="button"
                className="chip"
                aria-pressed={gradeTag === ""}
                onClick={() => setGradeTag("")}
              >
                Tất cả
              </button>
              {GRADE_OPTIONS.map((o) => (
                <button
                  key={o.tag}
                  type="button"
                  className="chip"
                  aria-pressed={gradeTag === o.tag}
                  onClick={() => setGradeTag(o.tag)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          <div className="selects">
            {/* Select Loại theo mẫu (native select, cùng giá trị tag) */}
            <select
              className="lv-select"
              aria-label="Loại tài liệu"
              value={examTag}
              onChange={(e) => setExamTag(e.target.value)}
            >
              <option value="">Loại tài liệu</option>
              {EXAM_OPTIONS.map((o) => (
                <option key={o.tag} value={o.tag}>{o.label}</option>
              ))}
            </select>
            {hasFilter ? (
              <button type="button" onClick={resetFilters} className="outline">
                Xóa bộ lọc
              </button>
            ) : null}
          </div>
        </div>

        {/* Nhánh video: lưới thẻ YouTube tĩnh / empty riêng */}
        {isVideoMode ? (
          videoResults.length === 0 ? (
            <div className="empty-box">
              <div className="state-icon"><SearchX className="icon" /></div>
              <h2 className="lv-h2">Chưa tìm thấy video phù hợp</h2>
              <p>Hãy thử thay đổi từ khóa hoặc chọn loại khác để khám phá thêm.</p>
              <div className="more-row">
                <button onClick={resetFilters} className="primary" type="button">
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          ) : (
            <div className="lv-grid">
              {videoResults.map((v) => <StudyVideoCard key={v.id} video={v} />)}
            </div>
          )
        ) : error ? (
          <div className="empty-box">
            <div className="state-icon danger"><AlertTriangle className="icon" /></div>
            <h2 className="lv-h2">Không tải được tài liệu</h2>
            <p>{error}</p>
            <div className="more-row">
              <button onClick={() => load([gradeTag, examTag].filter(Boolean))} className="primary" type="button">
                Thử lại
              </button>
            </div>
          </div>
        ) : loading && docs.length === 0 ? (
          <p className="empty">Đang tải danh sách tài liệu...</p>
        ) : results.length === 0 ? (
          <div className="empty-box">
            <div className="state-icon"><SearchX className="icon" /></div>
            <h2 className="lv-h2">Chưa tìm thấy tài liệu phù hợp</h2>
            <p>Hãy thử thay đổi từ khóa hoặc xóa bộ lọc để khám phá thêm tài liệu.</p>
            <div className="more-row">
              <button onClick={resetFilters} className="primary" type="button">
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <div className="lv-grid">
            {results.map((doc) => <StudyDocCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </section>

      <footer className="lv-footer">
        <div className="lv-container footer-inner">
          <span>Trường THCS Lê Văn Tám　 | 　Cổng học liệu số</span>
          <span>Tri thức hôm nay – Vững bước tương lai</span>
        </div>
      </footer>

      <StudyToast message={toast} />
      <UnlockDialog
        open={showUnlock}
        onClose={() => { setShowUnlock(false); setReopenUpload(false); }}
        onUnlocked={() => {
          refresh();
          if (reopenUpload) {
            setReopenUpload(false);
            setShowUpload(true);
          }
        }}
      />
      <UploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onNeedUnlock={() => { setShowUpload(false); setReopenUpload(true); setShowUnlock(true); refresh(); }}
        onUploaded={handleUploaded}
      />
    </main>
  );
}
