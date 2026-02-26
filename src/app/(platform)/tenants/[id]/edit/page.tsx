import { redirect, notFound } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditTenantForm } from "../../edit-tenant-form";

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/login");

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id, deletedAt: null },
    include: {
      users: {
        take: 1,
        where: { role: "COMPANY_ADMIN" },
        orderBy: { createdAt: "asc" },
        select: { email: true },
      },
    },
  });
  if (!tenant) notFound();

  const platformDomain = process.env.PLATFORM_DOMAIN || "dhisme.so";
  const isProduction = !platformDomain.includes("localhost");
  const tenantUrl = `${isProduction ? "https" : "http"}://${tenant.subdomain}.${platformDomain}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Edit tenant</h1>
      <p className="text-sm text-slate-600">
        Tenant URL: <a href={tenantUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 underline">{tenantUrl}</a>
      </p>
      <EditTenantForm
        tenant={{
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          status: tenant.status,
          subscriptionExpiryAt: tenant.subscriptionExpiryAt,
        }}
        adminEmail={tenant.users[0]?.email ?? ""}
      />
    </div>
  );
}
