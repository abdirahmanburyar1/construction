import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ReportFilters } from "../report-filters";
import { ReportPrintButton } from "../report-print-button";
import { ReportExportButtons, type ReportProjectExport } from "../report-export-buttons";

const CATEGORY_LABELS: Record<string, string> = {
  MATERIAL: "Materials",
  LABOR: "Labor",
  EQUIPMENT: "Equipment",
  SUBCONTRACT: "Subcontract",
  OTHER: "Other",
};

function parseMonthRange(from: string | null, to: string | null): { start: Date; end: Date; label: string } {
  const now = new Date();
  const fromMonth = from?.match(/^(\d{4})-(\d{2})$/);
  const toMonth = to?.match(/^(\d{4})-(\d{2})$/);
  let start: Date;
  let end: Date;
  if (fromMonth && toMonth) {
    start = new Date(parseInt(fromMonth[1], 10), parseInt(fromMonth[2], 10) - 1, 1, 0, 0, 0, 0);
    end = new Date(parseInt(toMonth[1], 10), parseInt(toMonth[2], 10), 0, 23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  const startLabel = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const label = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  return { start, end, label };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function FinancialReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; projectId?: string; clientId?: string; category?: string; materialId?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const params = await searchParams;
  const from = params.from ?? null;
  const to = params.to ?? null;
  const projectIdParam = params.projectId ?? null;
  const clientIdParam = params.clientId ?? null;
  const categoryParam = params.category ?? null;
  const materialIdParam = params.materialId ?? null;

  const { start: rangeStart, end: rangeEnd, label: periodLabel } = parseMonthRange(from, to);

  const projectWhere = {
    tenantId: tenant.id,
    deletedAt: null,
    ...(clientIdParam ? { clientId: clientIdParam } : {}),
    ...(projectIdParam ? { id: projectIdParam } : {}),
  };

  const [projectsMatchingFilters, allProjectsForFilters, clients, materials] = await Promise.all([
    prisma.project.findMany({
      where: projectWhere,
      select: { id: true, name: true, clientId: true, budget: true, status: true, startDate: true, endDate: true, client: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { tenantId: tenant.id, deletedAt: null },
      select: { id: true, name: true, clientId: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { tenantId: tenant.id, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.materialCatalog.findMany({
      where: { tenantId: tenant.id },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const projectIds = projectsMatchingFilters.map((p) => p.id);
  const categoriesFromMaterials = Array.from(new Set(materials.map((m) => m.category).filter(Boolean))) as string[];
  categoriesFromMaterials.sort();

  const materialNameForFilter = materialIdParam ? materials.find((m) => m.id === materialIdParam)?.name ?? null : null;

  const itemConditions = materialNameForFilter
    ? { some: { materials: materialNameForFilter } }
    : undefined;

  const expenseWhere = {
    tenantId: tenant.id,
    deletedAt: null,
    projectId: { in: projectIds },
    expenseDate: { gte: rangeStart, lte: rangeEnd },
    ...(categoryParam ? { category: categoryParam as "MATERIAL" | "LABOR" | "EQUIPMENT" | "SUBCONTRACT" | "OTHER" } : {}),
    ...(itemConditions ? { items: itemConditions } : {}),
  };

  const [expensesForProjects, depositsForProjects] = await Promise.all([
    projectIds.length > 0
      ? prisma.expense.findMany({
          where: expenseWhere,
          orderBy: [{ projectId: "asc" }, { expenseDate: "asc" }],
          include: { items: true },
        })
      : [],
    projectIds.length > 0
      ? prisma.projectDeposit.findMany({
          where: {
            tenantId: tenant.id,
            projectId: { in: projectIds },
            paidAt: { gte: rangeStart, lte: rangeEnd },
          },
        })
      : [],
  ]);

  const depositsByProject = new Map<string, number>();
  for (const d of depositsForProjects) {
    depositsByProject.set(d.projectId, (depositsByProject.get(d.projectId) ?? 0) + Number(d.amount));
  }

  type ExpenseRow = { date: string; material: string; qty: number; unitPrice: number; amount: number };
  type ReportProject = {
    id: string;
    name: string;
    clientName: string | null;
    budget: number;
    received: number;
    status: string;
    startEnd: string;
    expenses: ExpenseRow[];
    totalExpenses: number;
  };

  const reportProjects: ReportProject[] = projectsMatchingFilters.map((proj) => {
    const projectExpenses = expensesForProjects.filter((e) => e.projectId === proj.id);
    const expenseRows: ExpenseRow[] = [];
    for (const exp of projectExpenses) {
      if (exp.items.length > 0) {
        for (const item of exp.items) {
          const qty = Number(item.quantity);
          const unitPrice = Number(item.unitPrice);
          const amount = qty * unitPrice;
          expenseRows.push({
            date: formatDate(exp.expenseDate),
            material: item.materials,
            qty,
            unitPrice,
            amount,
          });
        }
      } else {
        expenseRows.push({
          date: formatDate(exp.expenseDate),
          material: exp.title,
          qty: Number(exp.quantity ?? 1),
          unitPrice: Number(exp.unitCost ?? exp.amount),
          amount: Number(exp.amount),
        });
      }
    }
    expenseRows.sort((a, b) => a.date.localeCompare(b.date));
    const totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
    const received = depositsByProject.get(proj.id) ?? 0;
    const startEnd = [
      proj.startDate ? formatDate(proj.startDate) : "",
      proj.endDate ? formatDate(proj.endDate) : "",
    ].filter(Boolean).join(" – ") || "—";
    return {
      id: proj.id,
      name: proj.name,
      clientName: proj.client?.name ?? null,
      budget: Number(proj.budget),
      received,
      status: STATUS_LABELS[proj.status] ?? proj.status,
      startEnd,
      expenses: expenseRows,
      totalExpenses,
    };
  });

  const reportDataForExport: ReportProjectExport[] = reportProjects.map((p) => ({
    name: p.name,
    clientName: p.clientName,
    budget: p.budget,
    received: p.received,
    status: p.status,
    startEnd: p.startEnd,
    expenses: p.expenses,
    totalExpenses: p.totalExpenses,
  }));

  const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Report</h1>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Reports
          </Link>
          <ReportPrintButton />
          <ReportExportButtons reportData={reportDataForExport} periodLabel={periodLabel} generatedAt={generatedAt} />
        </div>
      </div>

      <ReportFilters
        basePath="/reports/financial"
        projects={allProjectsForFilters.map((p) => ({ id: p.id, name: p.name, clientId: p.clientId }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        categories={categoriesFromMaterials}
        materials={materials.map((m) => ({ id: m.id, name: m.name, category: m.category }))}
        showCategoryMaterial={true}
      />

      <p className="text-sm text-slate-500 print:hidden">
        Period: {periodLabel} · Generated on {generatedAt}
      </p>

      <div className="space-y-8">
        {reportProjects.map((proj) => (
          <section
            key={proj.id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:shadow-none"
          >
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">{proj.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {proj.clientName ?? "—"} · Budget {formatCurrency(proj.budget)} · Received {formatCurrency(proj.received)} · {proj.status}
                {proj.startEnd !== "—" ? ` · ${proj.startEnd}` : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="border-b border-slate-200 px-5 py-3 font-semibold text-slate-700">Date</th>
                    <th className="border-b border-slate-200 px-5 py-3 font-semibold text-slate-700">Line item</th>
                    <th className="border-b border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Qty</th>
                    <th className="border-b border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Unit price</th>
                    <th className="border-b border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                        No expenses in this period
                      </td>
                    </tr>
                  ) : (
                    proj.expenses.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 text-slate-700 whitespace-nowrap">{row.date}</td>
                        <td className="px-5 py-2.5 text-slate-800">{row.material}</td>
                        <td className="px-5 py-2.5 text-right text-slate-700 tabular-nums">{row.qty}</td>
                        <td className="px-5 py-2.5 text-right text-slate-700 tabular-nums">{formatCurrency(row.unitPrice)}</td>
                        <td className="px-5 py-2.5 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(row.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/80 font-semibold">
                    <td colSpan={4} className="border-t border-slate-200 px-5 py-3 text-slate-800">
                      Total
                    </td>
                    <td className="border-t border-slate-200 px-5 py-3 text-right text-slate-900 tabular-nums">
                      {formatCurrency(proj.totalExpenses)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        ))}
      </div>

      {reportProjects.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-slate-500">
          No projects match the selected filters. Adjust from/to, client, project, category, or material and generate the report.
        </p>
      )}
    </div>
  );
}
