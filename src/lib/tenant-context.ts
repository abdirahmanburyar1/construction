import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { getTenantBySlug, getSubdomain } from "./tenant";

export class TenantNotFoundError extends Error {
  constructor(slug: string | null) {
    super(slug ? `Tenant not found: ${slug}` : "Tenant not found");
    this.name = "TenantNotFoundError";
  }
}

export const getTenantForRequest = cache(async () => {
  const h = await headers();
  const slugFromHeader = h.get("x-tenant-slug") ?? null;
  const host = h.get("host") ?? h.get("x-forwarded-host") ?? "";
  const slugFromHost = getSubdomain(host);
  const slug = slugFromHeader ?? slugFromHost;

  if (slug) {
    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
      throw new TenantNotFoundError(slug);
    }
    return tenant;
  }

  throw new TenantNotFoundError(null);
});
