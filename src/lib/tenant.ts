import { prisma } from "./prisma";

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
  status: string;
  subscriptionExpiryDate: Date | null;
  faviconUrl: string | null;
};

export function getMainDomain(host: string): string {
  const domain = process.env.PLATFORM_DOMAIN || "localhost:3000";
  return domain.split(":")[0];
}

export function getSubdomain(host: string): string | null {
  const main = getMainDomain(host);
  const hostWithoutPort = host.split(":")[0];
  if (hostWithoutPort === main || hostWithoutPort === "localhost") return null;
  if (hostWithoutPort.endsWith(`.${main}`)) {
    const sub = hostWithoutPort.slice(0, -main.length - 1);
    return sub || null;
  }
  return null;
}

export async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      deletedAt: null,
      subdomain: { equals: slug, mode: "insensitive" },
    },
    select: {
      id: true,
      subdomain: true,
      name: true,
      status: true,
      subscriptionExpiryAt: true,
      trialEndsAt: true,
      faviconUrl: true,
    },
  });
  if (!tenant) return null;
  const subscriptionExpiryDate = tenant.subscriptionExpiryAt ?? tenant.trialEndsAt ?? null;
  return {
    id: tenant.id,
    slug: tenant.subdomain,
    name: tenant.name,
    status: tenant.status,
    subscriptionExpiryDate,
    faviconUrl: tenant.faviconUrl ?? null,
  };
}

export function isSubscriptionActive(status: string, expiryDate: Date | null): boolean {
  if (status === "EXPIRED" || status === "SUSPENDED") return false;
  if (expiryDate && new Date(expiryDate) < new Date()) return false;
  return true;
}
