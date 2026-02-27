import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "../expense-form";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { projectId } = await searchParams;
  const [projects, materials] = await Promise.all([
    prisma.project.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.materialCatalog.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="page-title">Add expense</h1>
      <p className="page-subtitle">Record materials, labor, or other costs for a project</p>
      <ExpenseForm
        projects={projects}
        materials={materials}
        defaultProjectId={projectId ?? undefined}
      />
    </div>
  );
}
