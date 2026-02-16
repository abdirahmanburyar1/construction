import { getTenantForRequest } from "@/lib/tenant-context";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getTenantForRequest();
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
