import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Temporarily bypass tenant subdomains and just run everything on the main domain
  
  if (pathname.startsWith("/admin")) {
    const newPath = pathname === "/admin" || pathname === "/admin/"
      ? "/"
      : pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Rewrite / to /dashboard
  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/dashboard", request.url));
  }

  // Hide the actual /dashboard URL by redirecting to /
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
