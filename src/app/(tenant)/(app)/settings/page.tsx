import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const tenant = await getTenantForRequest();
  const data = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: { name: true, businessInfo: true, logoUrl: true, faviconUrl: true },
  });

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">System information, logo and favicon (stored on ImageKit)</p>
      <SettingsForm
        initialName={data.name}
        initialBusinessInfo={data.businessInfo}
        initialLogoUrl={data.logoUrl}
        initialFaviconUrl={data.faviconUrl}
        tenantId={tenant.id}
      />
    </div>
  );
}
