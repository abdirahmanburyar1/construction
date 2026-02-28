import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tenant-exists?slug=xxx
 * Returns 200 if a tenant with that subdomain exists, 404 otherwise.
 * Used by middleware to check subdomain before allowing access.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }
  const tenant = await prisma.tenant.findFirst({
    where: {
      deletedAt: null,
      subdomain: { equals: slug, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (!tenant) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
  return NextResponse.json({ exists: true });
}
