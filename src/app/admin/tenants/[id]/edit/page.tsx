import { redirect, notFound } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditTenantForm } from "../../edit-tenant-form";

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });
  if (!tenant) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Edit tenant</h1>
      <EditTenantForm tenant={tenant} />
    </div>
  );
}
