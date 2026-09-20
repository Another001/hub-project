// GET /api/auth/status — FE hỏi "đã unlock chưa?" để hiện nút Upload/modal.
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ unlocked: isAuthenticated() });
}
