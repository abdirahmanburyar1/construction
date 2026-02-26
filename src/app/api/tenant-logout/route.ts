import { NextRequest, NextResponse } from "next/server";

const TENANT_SESSION_COOKIE = "tenant_session";

export async function POST(request: NextRequest) {
  const url = new URL("/login", request.url);
  const res = NextResponse.redirect(url);
  const isProduction = process.env.NODE_ENV === "production";
  const platformDomain = process.env.PLATFORM_DOMAIN || "localhost:3000";
  const domain = isProduction && platformDomain.includes(".") ? `.${platformDomain.split(":")[0]}` : undefined;
  res.cookies.set(TENANT_SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    ...(domain && { domain }),
  });
  return res;
}
