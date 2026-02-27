import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./prisma";

export const getTenantForRequest = cache(async () => {
  // Temporarily bypass subdomain check and just return the first tenant
  const tenant = await prisma.tenant.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' }
  });

  if (!tenant) {
    throw new Error("No tenant found. Please create a tenant in the database first.");
  }

  const subscriptionExpiryDate = tenant.subscriptionExpiryAt ?? tenant.trialEndsAt ?? null;
  return {
    id: tenant.id,
    slug: tenant.subdomain,
    name: tenant.name,
    status: tenant.status,
    subscriptionExpiryDate,
    faviconUrl: tenant.faviconUrl ?? null,
  };
});
