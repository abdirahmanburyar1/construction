import { getTenantForRequest } from "@/lib/tenant-context";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getTenantForRequest();
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="w-full">{children}</main>
    </div>
  );
}
