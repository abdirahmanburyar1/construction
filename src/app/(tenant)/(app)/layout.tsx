import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { AppShell } from "../app-shell";

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
    <AppShell userEmail={session.email} tenantName={tenant.name}>
      {children}
    </AppShell>
  );
}
