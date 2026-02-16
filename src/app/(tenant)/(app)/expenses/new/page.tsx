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
  const projects = await prisma.project.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add expense</h1>
      <ExpenseForm projects={projects} defaultProjectId={projectId ?? undefined} />
    </div>
  );
}
