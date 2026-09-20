// Rate-limit nhẹ bằng memory (đủ cho quy mô 1 instance / demo).
// Deploy nhiều instance thì thay bằng Redis/Upstash sau.
type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now >= cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (cur.count < limit) {
    cur.count += 1;
    return { ok: true, retryAfterSec: 0 };
  }
  return { ok: false, retryAfterSec: Math.ceil((cur.resetAt - now) / 1000) };
}

// Dọn bucket cũ để khỏi phình memory (gọi thưa, không cần chính xác).
export function sweepRateLimit(): void {
  if (buckets.size < 1000) return;
  const now = Date.now();
  buckets.forEach((v, k) => {
    if (now >= v.resetAt) buckets.delete(k);
  });
}

export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}
