import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { CreateTenantForm } from "../create-tenant-form";

export default async function NewTenantPage() {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Create tenant</h1>
      <CreateTenantForm />
    </div>
  );
}
