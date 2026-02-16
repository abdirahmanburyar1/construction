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
  if (!session || session.id !== tenant.id) {
    redirect("/login");
  }
  return (
    <>
      <TenantNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </>
  );
}
