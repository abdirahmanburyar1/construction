import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ReportPrintButton } from "./report-print-button";
import { ReportDateFilter } from "./report-date-filter";

const CATEGORY_LABELS: Record<string, string> = {
  MATERIAL: "Materials",
  LABOR: "Labor",
  EQUIPMENT: "Equipment",
  SUBCONTRACT: "Subcontract",
  OTHER: "Other",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { from: fromParam, to: toParam } = await searchParams;

  const fromDate = fromParam ? new Date(fromParam) : null;
  const toDate = toParam ? new Date(toParam) : null;

  const expenseWhere = {
    tenantId: tenant.id,
    deletedAt: null,
    ...(fromDate && toDate
      ? { expenseDate: { gte: fromDate, lte: toDate } }
      : {}),
  };

  const [projects, expenseByCategory, expenseByProject, totals] = await Promise.all([
    prisma.project.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, budget: true, status: true },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.expense.groupBy({
      by: ["projectId"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.expense.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const totalSpent = Number(totals._sum.amount ?? 0);
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget), 0);
  const expenseByProjectMap = new Map(expenseByProject.map((e) => [e.projectId, { sum: Number(e._sum.amount ?? 0), count: e._count.id }]));

  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8 print:space-y-6" id="report-content">
      {/* Header */}
      <div className="flex flex-col gap-4 print:gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 print:text-xl">
              Financial Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {fromDate && toDate
                ? `Period: ${fromDate.toLocaleDateString()} – ${toDate.toLocaleDateString()}`
                : "All time"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 print:text-slate-600">
              Generated on {generatedAt}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <ReportPrintButton />
          </div>
        </div>
        <div className="print:hidden">
          <ReportDateFilter />
        </div>
      </div>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:shadow-none print:border-slate-300">
          <p className="text-sm font-medium text-slate-500">Total Budget</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalBudget)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:shadow-none print:border-slate-300">
          <p className="text-sm font-medium text-slate-500">Total Spent</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:shadow-none print:border-slate-300">
          <p className="text-sm font-medium text-slate-500">Remaining</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.max(0, totalBudget - totalSpent))}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:shadow-none print:border-slate-300">
          <p className="text-sm font-medium text-slate-500">Expense Records</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totals._count.id}</p>
        </div>
      </section>

      {/* Expenses by category */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Expenses by Category</h2>
          <p className="mt-0.5 text-sm text-slate-500">Breakdown of spending by expense type</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 font-semibold text-slate-700">Category</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Transactions</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Amount</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {expenseByCategory.map((row) => {
                const amount = Number(row._sum.amount ?? 0);
                const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                return (
                  <tr key={row.category} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {CATEGORY_LABELS[row.category] ?? row.category}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-right">{row._count.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-900 text-right">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-right">
                      {pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expenseByCategory.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            No expenses in this period
          </div>
        )}
      </section>

      {/* Project financial summary */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Project Financial Summary</h2>
          <p className="mt-0.5 text-sm text-slate-500">Budget vs. spent per project</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 font-semibold text-slate-700">Project</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700">Status</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Budget</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Spent</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Remaining</th>
                <th className="px-5 py-3.5 font-semibold text-slate-700 text-right">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const spent = expenseByProjectMap.get(p.id)?.sum ?? 0;
                const budget = Number(p.budget);
                const remaining = Math.max(0, budget - spent);
                const utilization = budget > 0 ? (spent / budget) * 100 : 0;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(budget)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-800">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(spent)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(remaining)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={utilization > 90 ? "text-red-600 font-medium" : utilization > 70 ? "text-amber-600" : "text-slate-600"}>
                        {utilization.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {projects.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            No projects
          </div>
        )}
      </section>

      {/* Footer for print */}
      <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400 print:pt-2">
        This report was generated from Construction Investment Management. Confidential.
      </div>
    </div>
  );
}
