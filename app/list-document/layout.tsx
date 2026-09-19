// Layout riêng cho cụm màn list-document:
// nạp font DM Sans + Fraunces đúng mẫu và file styles.css của cụm này.
import "./styles.css";

export default function ListDocumentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"
        rel="stylesheet"
      />
      <div className="page-shell" style={{ fontFamily: '"DM Sans", sans-serif', color: "#16324a" }}>
        {children}
      </div>
    </>
  );
}
