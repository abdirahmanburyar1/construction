import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "@/lib/tenant";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";
const MAIN_HOST = PLATFORM_DOMAIN.split(":")[0];

export function middleware(request: NextRequest) {
  // Use x-forwarded-host when behind Vercel/proxy so albayaan.dhisme.so is detected
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const newPath = pathname === "/admin" || pathname === "/admin/"
      ? "/"
      : pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  const isSuspendedPage = pathname === "/suspended";
  const subdomain = getSubdomain(host);
  const hostWithoutPort = host.split(":")[0];
  const isMainDomain = !subdomain || hostWithoutPort === MAIN_HOST || hostWithoutPort === "localhost";

  if (isMainDomain) {
    if (pathname === "/" || pathname === "/login" || pathname === "/contact" || isSuspendedPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (subdomain) {
    // Keep dashboard hidden: tenant home is "/", not "/dashboard"
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const res = NextResponse.next();
    res.headers.set("x-tenant-slug", subdomain);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
