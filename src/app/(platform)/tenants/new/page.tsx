import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { CreateTenantForm } from "../create-tenant-form";

export default async function NewTenantPage() {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/login");

  const platformDomain = process.env.PLATFORM_DOMAIN || "dhisme.so";
  const isProduction = !platformDomain.includes("localhost");
  const protocol = isProduction ? "https" : "http";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Create tenant</h1>
      <p className="text-slate-600">
        The subdomain is created automatically from the slug when you create the tenant. The tenant will log in at{" "}
        <strong>{protocol}://[slug].{platformDomain}</strong>.
      </p>
      <CreateTenantForm platformDomain={platformDomain} protocol={protocol} />
    </div>
  );
}
