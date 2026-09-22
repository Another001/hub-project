// Layout riêng cho cụm màn list-document:
// theme xanh lá theo file mẫu thu-vien-toan.html (font hệ thống, nền #f5f7f8).
import "./styles.css";

export default function ListDocumentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      {children}
    </div>
  );
}
