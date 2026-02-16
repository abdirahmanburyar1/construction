import { redirect } from "next/navigation";
import { cache } from "react";
import { headers } from "next/headers";
import { getTenantBySlug, isSubscriptionActive } from "./tenant";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";
const isProduction = !PLATFORM_DOMAIN.includes("localhost");
const BASE_URL = `${isProduction ? "https" : "http"}://${PLATFORM_DOMAIN}`;

export const getTenantForRequest = cache(async () => {
  const h = await headers();
  const slug = h.get("x-tenant-slug");
  if (!slug) redirect(`${BASE_URL}/admin`);

  const tenant = await getTenantBySlug(slug);
  if (!tenant) redirect(`${BASE_URL}/suspended`);
  if (!isSubscriptionActive(tenant.subscriptionStatus, tenant.subscriptionExpiryDate)) {
    redirect(`${BASE_URL}/suspended`);
  }
  return tenant;
});
