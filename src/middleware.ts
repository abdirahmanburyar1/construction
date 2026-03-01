import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "@/lib/tenant";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? "";
  const slug = getSubdomain(host);

  // Skip tenant check for API that performs the check (avoid loop) and for contact page
  const isTenantCheckApi = pathname.startsWith("/api/tenant-exists");
  const isContactPage = pathname === "/contact";
  if (isTenantCheckApi || isContactPage) {
    return NextResponse.next();
  }

  // When on a subdomain (*.dhisme.so), verify tenant exists before allowing access
  if (slug) {
    const host = request.headers.get("host") ?? "";
    const protocol = request.nextUrl.protocol;
    const checkUrl = `${protocol}//${host}/api/tenant-exists?slug=${encodeURIComponent(slug)}`;
    try {
      const check = await fetch(checkUrl, {
        headers: { "x-middleware-request": "1" },
        cache: "no-store",
      });
      if (!check.ok) {
        return NextResponse.redirect(new URL("/contact", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/contact", request.url));
    }
  }

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
