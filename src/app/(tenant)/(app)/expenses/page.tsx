import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { page = "1" } = await searchParams;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const skip = (current - 1) * PAGE_SIZE;

  const [expenses, total, aggregate] = await Promise.all([
    prisma.expense.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      skip,
      orderBy: { expenseDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.expense.count({ where: { tenantId: tenant.id } }),
    prisma.expense.aggregate({
      where: { tenantId: tenant.id },
      _sum: { amount: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalAmount = aggregate._sum.amount ? Number(aggregate._sum.amount) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Labor, materials, equipment, and other costs</p>
        </div>
        <Link href="/expenses/new" className="btn btn-primary shrink-0">
          Add expense
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total expenses</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Records</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3.5 font-semibold text-slate-700">Title</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Project</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Qty</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Unit cost</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{e.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${e.projectId}`}
                      className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {e.project.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.quantity != null ? Number(e.quantity) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.unitCost != null
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(e.unitCost))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(e.amount))}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(e.expenseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-500">No expenses yet</p>
            <Link href="/expenses/new" className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700">
              Add your first expense
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Page {current} of {totalPages}
            </p>
            <div className="flex gap-2">
              {current > 1 && (
                <Link href={`/expenses?page=${current - 1}`} className="btn btn-secondary text-sm">
                  Previous
                </Link>
              )}
              {current < totalPages && (
                <Link href={`/expenses?page=${current + 1}`} className="btn btn-secondary text-sm">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
