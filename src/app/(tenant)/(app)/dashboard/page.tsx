import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function DashboardPage() {
  const tenant = await getTenantForRequest();

  const [projectCount, materialAgg, expenseAgg, projectsWithTotals] = await Promise.all([
    prisma.project.count({ where: { tenantId: tenant.id } }),
    prisma.material.aggregate({
      where: { tenantId: tenant.id },
      _sum: { totalPrice: true },
    }),
    prisma.expense.aggregate({
      where: { tenantId: tenant.id },
      _sum: { amount: true },
    }),
    prisma.project.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { materials: true, expenses: true } },
      },
    }),
  ]);

  const totalMaterials = Number(materialAgg._sum.totalPrice ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const totalInvestment = totalMaterials + totalExpenses;

  const projectIds = projectsWithTotals.map((p) => p.id);
  const [materialByProject, expenseByProject] = await Promise.all([
    prisma.material.groupBy({
      by: ["projectId"],
      where: { tenantId: tenant.id, projectId: { in: projectIds } },
      _sum: { totalPrice: true },
    }),
    prisma.expense.groupBy({
      by: ["projectId"],
      where: { tenantId: tenant.id, projectId: { in: projectIds } },
      _sum: { amount: true },
    }),
  ]);

  const materialMap = new Map(materialByProject.map((m) => [m.projectId, Number(m._sum.totalPrice ?? 0)]));
  const expenseMap = new Map(expenseByProject.map((e) => [e.projectId, Number(e._sum.amount ?? 0)]));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your projects and investment</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Projects</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{projectCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Materials Cost</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalMaterials)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Investment</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-teal-700">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvestment)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Projects summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Project</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Status</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Materials</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Expenses</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Total</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectsWithTotals.map((p) => {
                const mat = materialMap.get(p.id) ?? 0;
                const exp = expenseMap.get(p.id) ?? 0;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.status}</td>
                    <td className="px-5 py-3.5 text-slate-600">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mat)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(exp)}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mat + exp)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/projects/${p.id}`} className="font-medium text-teal-600 hover:text-teal-700">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projectCount > PAGE_SIZE && (
          <div className="border-t border-slate-200 px-6 py-4">
            <Link href="/projects" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all projects →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
