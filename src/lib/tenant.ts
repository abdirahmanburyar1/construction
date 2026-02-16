import { prisma } from "./prisma";

export type TenantContext = {
  id: string;
  slug: string;
  companyName: string;
  email: string;
  subscriptionStatus: string;
  subscriptionExpiryDate: Date | null;
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
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      companyName: true,
      email: true,
      subscriptionStatus: true,
      subscriptionExpiryDate: true,
    },
  });
  return tenant;
}

export function isSubscriptionActive(status: string, expiryDate: Date | null): boolean {
  if (status === "EXPIRED" || status === "SUSPENDED") return false;
  if (expiryDate && new Date(expiryDate) < new Date()) return false;
  return true;
}
