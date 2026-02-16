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
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your projects and investment</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{projectCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Materials Cost</span>
          <span className="stat-value">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalMaterials)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Investment</span>
          <span className="stat-value-accent">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvestment)}
          </span>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Projects summary</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Materials</th>
                <th>Expenses</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projectsWithTotals.map((p) => {
                const mat = materialMap.get(p.id) ?? 0;
                const exp = expenseMap.get(p.id) ?? 0;
                return (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-800">{p.name}</td>
                    <td>{p.status}</td>
                    <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mat)}</td>
                    <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(exp)}</td>
                    <td className="font-medium">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(mat + exp)}
                    </td>
                    <td>
                      <Link href={`/projects/${p.id}`} className="font-medium text-primary-600 hover:text-primary-700">
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
          <p className="mt-4">
            <Link href="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all projects →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
