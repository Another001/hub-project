// POST /api/auth/logout — xóa cookie unlock.
import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth";

export async function POST() {
  let cookieName = "hub_auth";
  try {
    cookieName = getAuthConfig().cookieName;
  } catch {
    // Thiếu env thì vẫn xóa cookie mặc định, không throw.
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
