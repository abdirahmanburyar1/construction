import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "../client-form";

export default async function NewClientPage() {
  const tenant = await getTenantForRequest();
  const projects = await prisma.project.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add client</h1>
      <ClientForm projects={projects} />
    </div>
  );
}
