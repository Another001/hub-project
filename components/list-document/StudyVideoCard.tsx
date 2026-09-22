// Thẻ video YouTube, vỏ .card theo mẫu thu-vien-toan.html (xanh lá).
// Logic giữ nguyên: bấm vào mở tab YouTube mới (không router chi tiết, không iframe).
"use client";

import { ArrowRight, Play } from "lucide-react";
import { toYouTubeThumbnail, toYouTubeUrl, type ListVideo } from "@/lib/list-videos";

export default function StudyVideoCard({ video }: { video: ListVideo }) {
  const open = () => window.open(toYouTubeUrl(video.youtubeId), "_blank", "noopener,noreferrer");

  return (
    <article className="card">
      {/* Thumbnail YouTube + nút play + badge thời lượng */}
      <button className="thumb-wrap" type="button" onClick={open} aria-label={`Xem ${video.title} trên YouTube`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={toYouTubeThumbnail(video.youtubeId)} alt={video.title} loading="lazy" />
        <span className="thumb-play" aria-hidden="true">
          <span>
            <Play className="icon" />
          </span>
        </span>
        <span className="thumb-time">{video.duration}</span>
      </button>

      <div className="card-head" style={{ marginTop: 14 }}>
        <div className="min-w-0">
          <span className="category">VIDEO · {video.subject.toUpperCase()}</span>
          <h3 className="lv-h3">{video.title}</h3>
        </div>
      </div>
      <p className="card-desc">{video.description}</p>
      <div className="meta">{video.channel} • Cập nhật {video.uploadedAt}</div>
      <div className="card-actions">
        <button className="view" type="button" onClick={open}>
          Xem trên YouTube
          <ArrowRight className="icon" aria-hidden="true" />
        </button>
        <button className="download" type="button" onClick={open} aria-label={`Xem ${video.title} trên YouTube`}>
          <Play className="icon" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
