import { redirect } from "next/navigation";
import { cache } from "react";
import { headers } from "next/headers";
import { getTenantBySlug, getSubdomain, isSubscriptionActive } from "./tenant";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";
const isProduction = !PLATFORM_DOMAIN.includes("localhost");
const BASE_URL = `${isProduction ? "https" : "http"}://${PLATFORM_DOMAIN}`;

export const getTenantForRequest = cache(async () => {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const slug = h.get("x-tenant-slug") || getSubdomain(host);
  if (!slug) redirect(`${BASE_URL}/`);

  const tenant = await getTenantBySlug(slug);
  if (!tenant) redirect(`${BASE_URL}/contact`);
  if (!isSubscriptionActive(tenant.status, tenant.subscriptionExpiryDate)) {
    redirect(`${BASE_URL}/suspended`);
  }
  return tenant;
});
