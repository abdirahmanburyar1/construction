import { redirect } from "next/navigation";
<<<<<<< HEAD

export default function HomePage() {
=======
import { headers } from "next/headers";
import { getSubdomain } from "@/lib/tenant";

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host") ?? h.get("x-forwarded-host") ?? "";
  const slug = getSubdomain(host);

  // If on apex domain (no subdomain), redirect to platform tenants management
  if (!slug) {
    redirect("/tenants");
  }

  // If on subdomain, redirect to tenant dashboard
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  redirect("/dashboard");
}
