import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
<<<<<<< HEAD

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

=======
import { getSubdomain } from "@/lib/tenant";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // 1. Domain/Subdomain Resolution
  const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? "";
  const slug = getSubdomain(host);

  // Skip middleware for static assets
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

<<<<<<< HEAD
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
=======
  // Define platform-only routes (restricted on subdomains)
  const restrictedOnSubdomains = ["/tenants", "/plans", "/audit"];
  const isRestrictedRoute = restrictedOnSubdomains.some(route => pathname.startsWith(route));

  // 2. Platform Portal Handling (dhisme.so)
  // If no subdomain, this is the platform portal
  if (!slug) {
    if (pathname === "/" || pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/tenants", request.url));
    }
    return NextResponse.next();
  }

  // 3. Tenant Handling (*.dhisme.so)
  // If on a subdomain, block access to platform-managed routes
  if (isRestrictedRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if tenant exists
  if (pathname !== "/login" && pathname !== "/contact" && pathname !== "/suspended") {
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
      return NextResponse.next();
    }
  }

  // Rewrite / to /dashboard for tenants
  if (pathname === "/") {
    const res = NextResponse.rewrite(new URL("/dashboard", request.url));
    res.headers.set("x-tenant-slug", slug);
    return res;
  }

  // Pass slug to downstream via header
  const res = NextResponse.next();
  res.headers.set("x-tenant-slug", slug);
  return res;
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
