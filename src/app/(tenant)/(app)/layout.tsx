import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { TenantNav } from "../tenant-nav";

export default async function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantForRequest();
  const session = await getTenantFromSession();
  if (!session || session.tenantId !== tenant.id) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen bg-slate-100">
      <TenantNav userEmail={session.email} tenantName={tenant.name} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
