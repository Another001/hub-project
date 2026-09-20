// Thẻ video YouTube cho nhánh "Video bài giảng".
// Style đồng bộ StudyDocCard: soft-card, badge, tiêu đề, mô tả, meta.
// Bấm vào mở tab YouTube mới (không dùng router chi tiết, không iframe).
"use client";

import { MonitorPlay, Play } from "lucide-react";
import { toYouTubeThumbnail, toYouTubeUrl, type ListVideo } from "@/lib/list-videos";

export default function StudyVideoCard({ video }: { video: ListVideo }) {
  const open = () => window.open(toYouTubeUrl(video.youtubeId), "_blank", "noopener,noreferrer");

  return (
    <article className="doc-card soft-card flex h-full flex-col rounded-2xl bg-white p-5">
      {/* Thumbnail YouTube + nút play + badge thời lượng */}
      <button className="relative block w-full overflow-hidden rounded-xl text-left" type="button" onClick={open} aria-label={`Xem ${video.title} trên YouTube`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toYouTubeThumbnail(video.youtubeId)}
          alt={video.title}
          className="aspect-video w-full bg-slate-100 object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg transition hover:scale-105">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/85 px-2 py-0.5 text-xs font-semibold text-white">
          {video.duration}
        </span>
      </button>

      <button className="flex min-w-0 flex-1 flex-col text-left" type="button" onClick={open}>
        <div className="mt-4 flex items-start justify-between gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <MonitorPlay className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Video bài giảng
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-sky-700">{video.subject}</p>
        <h3 className="mt-1 break-words text-lg font-bold leading-snug text-slate-800">{video.title}</h3>
        <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-500">{video.description}</p>
      </button>

      <div className="mt-5 border-t border-sky-50 pt-4 text-xs text-slate-500">
        {video.channel} • Cập nhật {video.uploadedAt}
      </div>
      <button
        onClick={open}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        type="button"
      >
        <Play className="h-4 w-4" />
        <span>Xem trên YouTube</span>
      </button>
    </article>
  );
}
