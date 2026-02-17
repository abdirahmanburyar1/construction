import { NextRequest, NextResponse } from "next/server";
import { clearTenantSession } from "@/lib/auth";

const TENANT_SESSION_COOKIE = "tenant_session";

export async function POST(request: NextRequest) {
  await clearTenantSession();
  const origin = request.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set(TENANT_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
