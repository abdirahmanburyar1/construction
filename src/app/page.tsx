import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSubdomain } from "@/lib/tenant";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host") || "";
  const subdomain = getSubdomain(host);

  if (subdomain) redirect("/dashboard");
  redirect("/admin");
}
