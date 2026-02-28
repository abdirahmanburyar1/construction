import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? "";
  const slug = getSubdomain(host);

  if (pathname.startsWith("/admin")) {
    const newPath = pathname === "/admin" || pathname === "/admin/"
      ? "/"
      : pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Rewrite / to /dashboard
  if (pathname === "/") {
    const res = NextResponse.rewrite(new URL("/dashboard", request.url));
    if (slug) res.headers.set("x-tenant-slug", slug);
    return res;
  }

  // Hide the actual /dashboard URL by redirecting to /
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const res = NextResponse.next();
  if (slug) res.headers.set("x-tenant-slug", slug);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
