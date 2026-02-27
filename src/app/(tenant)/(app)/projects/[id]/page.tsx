import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-teal-100 text-teal-800",
  ON_HOLD: "bg-slate-100 text-slate-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenantForRequest();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      expenses: {
        include: { items: true },
        orderBy: { expenseDate: "desc" },
      },
      client: { select: { id: true, name: true } },
    },
  });
  if (!project) notFound();

  const totalExpenses = project.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const budgetNum = Number(project.budget);
  const remaining = Math.max(0, budgetNum - totalExpenses);
  const spendPercent = budgetNum > 0 ? Math.min(100, (totalExpenses / budgetNum) * 100) : 0;

  const expensesByDate = project.expenses.reduce<Record<string, typeof project.expenses>>((acc, e) => {
    const key = new Date(e.expenseDate).toISOString().slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/projects" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              ← Projects
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {project.name}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                STATUS_STYLES[project.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
            <Link href={`/projects/${project.id}/edit`} className="btn btn-secondary text-sm">
              Edit
            </Link>
          </div>
          {(project.location || project.client) && (
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
              {project.location && <span>{project.location}</span>}
              {project.client && (
                <Link
                  href={`/clients`}
                  className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                >
                  {project.client.name}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Budget</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(budgetNum)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Spent</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
          </p>
          {budgetNum > 0 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  spendPercent > 90 ? "bg-red-500" : spendPercent > 70 ? "bg-amber-500" : "bg-teal-500"
                }`}
                style={{ width: `${spendPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Remaining</p>
          <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(remaining)}
          </p>
        </div>
      </div>

      {/* Expenses: grouped by date, then by expense id */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Expenses</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {project.expenses.length} record{project.expenses.length !== 1 ? "s" : ""}
              {sortedDates.length > 0 && ` · ${sortedDates.length} date${sortedDates.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href={`/expenses/new?projectId=${project.id}`} className="btn btn-primary text-sm">
            Add expense
          </Link>
        </div>
        <div className="divide-y divide-slate-200">
          {sortedDates.map((dateKey) => {
            const dateExpenses = expensesByDate[dateKey];
            const dateLabel = new Date(dateKey + "Z").toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const dayTotal = dateExpenses.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <details key={dateKey} className="group" open={sortedDates.length <= 3}>
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-left font-medium text-slate-800 hover:bg-slate-50/50 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    {dateLabel}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {dateExpenses.length} expense{dateExpenses.length !== 1 ? "s" : ""} ·{" "}
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dayTotal)}
                  </span>
                </summary>
                <div className="border-t border-slate-100 bg-slate-50/30 px-5 pb-4 pt-1">
                  {dateExpenses.map((e) => (
                    <div key={e.id} className="mt-4 first:mt-0">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{e.title}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(e.amount))}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                              <th className="px-3 py-2 font-semibold text-slate-700">Material</th>
                              <th className="px-3 py-2 font-semibold text-slate-700">Qty</th>
                              <th className="px-3 py-2 font-semibold text-slate-700">Unit price</th>
                              <th className="px-3 py-2 font-semibold text-slate-700">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {e.items.map((item) => {
                              const qty = Number(item.quantity);
                              const up = Number(item.unitPrice);
                              const rowTotal = qty * up;
                              return (
                                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                  <td className="px-3 py-2 text-slate-800">{item.materials}</td>
                                  <td className="px-3 py-2 text-slate-600">{qty}</td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(up)}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(rowTotal)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
        {project.expenses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-500">No expenses for this project</p>
            <Link
              href={`/expenses/new?projectId=${project.id}`}
              className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Add expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
