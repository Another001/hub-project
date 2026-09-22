// Header chung cụm list-document, giao diện theo mẫu thu-vien-toan.html:
// nền trắng, brand THCS LÊ VĂN TÁM bên trái, nút Đăng nhập/Đã mở khóa bên phải.
// Logic giữ nguyên: click brand về /list-document, auth (checking/unlocked/logout).
"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  unlocked?: boolean; // đã nhập mã chưa
  checking?: boolean; // đang hỏi /api/auth/status
  onUnlockClick?: () => void;
  onLogout?: () => void;
};

export default function SiteHeader({ unlocked, checking, onUnlockClick, onLogout }: Props) {
  const router = useRouter();
  const showAuth = onUnlockClick || onLogout;
  return (
    <header className="lv-header">
      <div className="lv-container header-inner">
        {/* Click logo -> về danh sách */}
        <button
          type="button"
          onClick={() => router.push("/list-document")}
          className="brand"
          aria-label="Về danh sách tài liệu - THCS Lê Văn Tám"
        >
          <span className="brand-mark" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-le-van-tam.png" alt="" className="logo" />
          </span>
          <span>THCS LÊ VĂN TÁM</span>
        </button>
        <div aria-label="Điều hướng chính" className="flex shrink-0 items-center gap-1">
          {showAuth ? (
            checking ? (
              <span className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted)" }}>
                Đang kiểm tra...
              </span>
            ) : unlocked ? (
              <button
                type="button"
                onClick={onLogout}
                className="login login-solid"
                title="Đã mở khóa tải lên — bấm để thoát"
              >
                <span className="hidden sm:inline">Đã mở khóa</span>
                <LogOut className="icon" />
              </button>
            ) : (
              <button type="button" onClick={onUnlockClick} className="login">
                <User className="icon" />
                <span>Đăng nhập</span>
              </button>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
