import { NextResponse } from "next/server";
import { clearTenantSession } from "@/lib/auth";

export async function POST() {
  await clearTenantSession();
  const domain = process.env.PLATFORM_DOMAIN || "localhost:3000";
  const isProduction = !domain.includes("localhost");
  const base = `${isProduction ? "https" : "http"}://${domain}`;
  return NextResponse.redirect(`${base}/login`);
}
