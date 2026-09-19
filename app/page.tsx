import { redirect } from "next/navigation";

// Trang mặc định "/" chuyển thẳng vào thư viện tài liệu.
export default function Home() {
  redirect("/list-document");
}
