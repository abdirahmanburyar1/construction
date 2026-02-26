import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export async function DashboardContent() {
  const tenant = await getTenantForRequest();

  const [projectCount, expenseAgg, projectsWithTotals] = await Promise.all([
    prisma.project.count({ where: { tenantId: tenant.id } }),
    prisma.expense.aggregate({
      where: { tenantId: tenant.id },
      _sum: { amount: true },
    }),
    prisma.project.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { expenses: true } },
      },
    }),
  ]);

  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const projectIds = projectsWithTotals.map((p) => p.id);
  const expenseByProject = await prisma.expense.groupBy({
    by: ["projectId"],
    where: { tenantId: tenant.id, projectId: { in: projectIds } },
    _sum: { amount: true },
  });
  const expenseMap = new Map(expenseByProject.map((e) => [e.projectId, Number(e._sum.amount ?? 0)]));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your projects and expenses</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Projects</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{projectCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
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
                <th className="px-5 py-3.5 font-semibold text-slate-700">Expenses</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectsWithTotals.map((p) => {
                const exp = expenseMap.get(p.id) ?? 0;
                return (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.status}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(exp)}
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
