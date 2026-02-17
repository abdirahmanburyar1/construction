import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function POST(request: NextRequest) {
  await clearAdminSession();
  const url = new URL("/login", request.nextUrl.origin);
  const res = NextResponse.redirect(url);
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
