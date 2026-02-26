import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const tenant = await getTenantForRequest();
  const clients = await prisma.client.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">New project</h1>
      <ProjectForm clients={clients} />
    </div>
  );
}
