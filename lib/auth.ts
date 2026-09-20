// Auth stateless cho gate "nhập mã -> nhận cookie".
// Mỗi user nhập đúng ACCESS_CODE nhận 1 token NGẪU NHIÊN RIÊNG, ký HMAC bằng AUTH_SECRET.
// Server KHÔNG lưu danh sách token, chỉ verify lại chữ ký + hạn bằng toán.
import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_DEFAULT = "hub_auth";

export function getAuthConfig() {
  const code = process.env.ACCESS_CODE ?? "";
  const secret = process.env.AUTH_SECRET ?? "";
  const cookieName = process.env.AUTH_COOKIE_NAME || AUTH_COOKIE_DEFAULT;
  const maxAge = Number(process.env.AUTH_MAX_AGE || "2592000"); // 30 ngày
  if (!code) throw new Error("Thiếu ACCESS_CODE trong .env.local");
  if (!secret || secret.length < 16) throw new Error("Thiếu AUTH_SECRET (>=16 ký tự) trong .env.local");
  return { code, secret, cookieName, maxAge: Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 2592000 };
}

// So sánh chuỗi an toàn (chống timing-attack), khác độ dài -> false ngay.
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function verifyAccessCode(input: string): boolean {
  const { code } = getAuthConfig();
  const v = (input ?? "").trim();
  if (!v) return false;
  return safeEqual(v, code);
}

// base64url không padding để nhét vào cookie an toàn.
function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Buffer {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  return Buffer.from(b64 + "=".repeat(pad), "base64");
}

type TokenPayload = { r: string; exp: number }; // r: random hex, exp: epoch giây

function signPayload(payloadB64: string, secret: string): string {
  return b64urlEncode(createHmac("sha256", secret).update(payloadB64).digest());
}

// Cấp token mới cho 1 user vừa nhập đúng mã.
export function createAuthToken(): { token: string; maxAge: number } {
  const { secret, maxAge } = getAuthConfig();
  const payload: TokenPayload = {
    r: randomBytes(32).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = signPayload(payloadB64, secret);
  return { token: `${payloadB64}.${sig}`, maxAge };
}

// Verify token từ cookie: đúng chữ ký + còn hạn -> true.
export function verifyAuthToken(token: string): boolean {
  try {
    const { secret } = getAuthConfig();
    const [payloadB64, sig] = (token ?? "").split(".");
    if (!payloadB64 || !sig) return false;
    const expected = signPayload(payloadB64, secret);
    if (!safeEqual(sig, expected)) return false;
    const payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8")) as TokenPayload;
    if (typeof payload.exp !== "number" || typeof payload.r !== "string") return false;
    if (payload.r.length < 32) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  try {
    const { cookieName } = getAuthConfig();
    const token = cookies().get(cookieName)?.value ?? "";
    return verifyAuthToken(token);
  } catch {
    return false;
  }
}

// Dùng đầu các API đặc biệt (upload...). Sai -> throw để route trả 401.
export function requireAuth(): void {
  if (!isAuthenticated()) {
    const err = new Error("Chưa mở khóa. Hãy nhập mã truy cập.");
    (err as NodeJS.ErrnoException).code = "UNAUTHORIZED";
    throw err;
  }
}

export function isUnauthorizedError(e: unknown): boolean {
  return e instanceof Error && (e as NodeJS.ErrnoException).code === "UNAUTHORIZED";
}
