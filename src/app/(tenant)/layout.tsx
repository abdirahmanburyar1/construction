<<<<<<< HEAD
import { getOrganization } from "@/lib/organization-context";

export default async function AppChromeLayout({
=======
import { getTenantForRequest } from "@/lib/tenant-context";

export default async function TenantLayout({
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  await getOrganization();
=======
  await getTenantForRequest();
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="w-full">{children}</main>
    </div>
  );
}
