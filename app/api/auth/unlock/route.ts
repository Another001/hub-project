// POST /api/auth/unlock — nhập đúng ACCESS_CODE -> nhận cookie token httpOnly.
// Body JSON: { "code": "ma-so" }
import { NextResponse, type NextRequest } from "next/server";
import { createAuthToken, getAuthConfig, verifyAccessCode } from "@/lib/auth";
import { clientIp, rateLimit, sweepRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  sweepRateLimit();
  const ip = clientIp(req.headers);
  const rl = rateLimit(`unlock:${ip}`, 5, 60_000); // 5 lần/phút/IP chống brute-force mã chung
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Nhập sai quá nhiều lần. Thử lại sau ${rl.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let code = "";
  try {
    const body = (await req.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "Body phải là JSON { code }." }, { status: 400 });
  }

  if (!verifyAccessCode(code)) {
    // Cố ý chung chung, không gợi ý mã gần đúng hay gì.
    return NextResponse.json({ error: "Mã truy cập không đúng." }, { status: 401 });
  }

  const { cookieName, maxAge } = getAuthConfig();
  const { token } = createAuthToken();
  const res = NextResponse.json({ ok: true, maxAge });
  res.cookies.set(cookieName, token, {
    httpOnly: true, // JS không đọc được -> chống XSS lấy cắp
    secure: process.env.NODE_ENV === "production", // prod bắt buộc HTTPS
    sameSite: "lax", // chặn phần lớn CSRF, vẫn giữ login khi điều hướng
    path: "/",
    maxAge,
  });
  return res;
}
