import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function POST(request: NextRequest) {
  const url = new URL("/login", request.nextUrl.origin);
  const res = NextResponse.redirect(url);
  // Clear cookie with same options used when setting (path, httpOnly, sameSite, secure)
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
