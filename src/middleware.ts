import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSubdomain } from "@/lib/tenant";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";
const MAIN_HOST = PLATFORM_DOMAIN.split(":")[0];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isSuspendedPage = pathname === "/suspended";

  const subdomain = getSubdomain(host);
  const hostWithoutPort = host.split(":")[0];
  const isMainDomain = !subdomain || hostWithoutPort === MAIN_HOST || hostWithoutPort === "localhost";

  if (isMainDomain) {
    if (isAdminRoute || isSuspendedPage || pathname === "/" || pathname === "/login") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (subdomain) {
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
