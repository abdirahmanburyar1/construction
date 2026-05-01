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
  const domain = process.env.PLATFORM_DOMAIN ?? "";
  return domain.split(":")[0];
}

export function getSubdomain(host: string): string | null {
  const main = getMainDomain(host);
  const hostWithoutPort = host.split(":")[0];
  
  // Local development support
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return "albayaan";
  }

  if (hostWithoutPort === main) return null;
  if (hostWithoutPort.endsWith(`.${main}`)) {
    const sub = hostWithoutPort.slice(0, -main.length - 1);
    return sub || null;
  }
  // Fallback when PLATFORM_DOMAIN is not set: treat first segment as subdomain
  // e.g. abc.dhisme.so -> "abc" so non-existing tenants still get caught
  const parts = hostWithoutPort.split(".");
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0] || null;
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

export async function getEnabledFeatures(tenantId: string): Promise<string[]> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      planId: true,
      tenantFeatureOverrides: {
        select: { featureId: true, enabled: true },
      },
    },
  });

  if (!tenant) return [];

  const enabledFeatureIds = new Set<string>();

  // 1. Get features from plan
  if (tenant.planId) {
    const planFeatures = await prisma.planFeature.findMany({
      where: { planId: tenant.planId, enabled: true },
      select: { featureId: true },
    });
    planFeatures.forEach((f) => enabledFeatureIds.add(f.featureId));
  }

  // 2. Apply overrides
  for (const override of tenant.tenantFeatureOverrides) {
    if (override.enabled) {
      enabledFeatureIds.add(override.featureId);
    } else {
      enabledFeatureIds.delete(override.featureId);
    }
  }

  // 3. Resolve to keys
  const features = await prisma.feature.findMany({
    where: { id: { in: Array.from(enabledFeatureIds) } },
    select: { key: true },
  });

  return features.map((f) => f.key);
}
