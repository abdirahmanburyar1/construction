import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const CATEGORIES = ["Labor", "Transport", "Equipment", "Permits", "Miscellaneous"];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { page = "1" } = await searchParams;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const skip = (current - 1) * PAGE_SIZE;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      skip,
      orderBy: { expenseDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.expense.count({ where: { tenantId: tenant.id } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Labor, transport, equipment, and other costs</p>
        </div>
        <Link href="/expenses/new" className="btn btn-primary shrink-0">
          Add expense
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="font-medium text-slate-800">{e.category}</td>
                <td>
                  <Link href={`/projects/${e.projectId}`} className="text-teal-600 hover:underline">
                    {e.project.name}
                  </Link>
                </td>
                <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(e.amount))}</td>
                <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                <td className="max-w-xs truncate text-slate-500">{e.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          {current > 1 && (
            <Link href={`/expenses?page=${current - 1}`} className="btn btn-secondary">
              Previous
            </Link>
          )}
          <span className="py-2 text-sm text-slate-600">
            Page {current} of {totalPages}
          </span>
          {current < totalPages && (
            <Link href={`/expenses?page=${current + 1}`} className="btn btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
