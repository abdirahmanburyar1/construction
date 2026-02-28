import React from "react";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ReportPrintButton } from "./report-print-button";
import { ReportFilters } from "./report-filters";
import { ReportExportButtons, type ReportProjectExport } from "./report-export-buttons";

const CATEGORY_LABELS: Record<string, string> = {
  MATERIAL: "Materials",
  LABOR: "Labor",
  EQUIPMENT: "Equipment",
  SUBCONTRACT: "Subcontract",
  OTHER: "Other",
};

function parseMonthRange(fromParam: string, toParam: string): { start: Date; end: Date } | null {
  if (!fromParam || !toParam) return null;
  const [fromY, fromM] = fromParam.split("-").map(Number);
  const [toY, toM] = toParam.split("-").map(Number);
  if (!fromY || !fromM || !toY || !toM) return null;
  const start = new Date(fromY, fromM - 1, 1, 0, 0, 0, 0);
  const end = new Date(toY, toM, 0, 23, 59, 59, 999);
  return start <= end ? { start, end } : null;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    projectId?: string;
    clientId?: string;
    category?: string;
    materialId?: string;
  }>;
}) {
  const tenant = await getTenantForRequest();
  const params = await searchParams;
  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const fromParam = toStr(params.from);
  const toParam = toStr(params.to);
  const projectIdParam = toStr(params.projectId);
  const clientIdParam = toStr(params.clientId);
  const categoryParam = toStr(params.category);
  const materialIdParam = toStr(params.materialId);

  const [projects, clients, materialsRaw] = await Promise.all([
    prisma.project.findMany({
      where: { tenantId: tenant.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true },
    }),
    prisma.client.findMany({
      where: { tenantId: tenant.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.materialCatalog.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true },
    }),
  ]);

  const materials = materialsRaw.map((m) => ({ id: m.id, name: m.name, category: m.category ?? null }));
  const categories = Array.from(new Set(materials.map((m) => m.category).filter(Boolean))) as string[];
  categories.sort();

  const monthRange = parseMonthRange(fromParam ?? "", toParam ?? "");
  const shouldFetchReport = monthRange !== null;

  type ProjectDeposit = {
    id: string;
    amount: { toString(): string };
    paidAt: Date;
    receiptNumber: string | null;
    reference: string | null;
    paymentMethod: string | null;
    accountNo: string | null;
  };
  type ProjectWithExpenses = {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    budget: { toString(): string };
    status: string;
    startDate: Date;
    endDate: Date | null;
    client: { name: string; phone: string | null; email: string | null; address: string | null } | null;
    deposits: ProjectDeposit[];
    expenses: Array<{
      id: string;
      title: string;
      amount: { toString(): string };
      category: string;
      expenseDate: Date;
      items: Array<{ materials: string; quantity: { toString(): string }; unitPrice: { toString(): string } }>;
    }>;
  };
  let reportProjects: ProjectWithExpenses[] = [];
  let generatedAt = "";

  if (shouldFetchReport && monthRange) {
    const materialName =
      materialIdParam && materials.length
        ? materials.find((m) => m.id === materialIdParam)?.name ?? null
        : null;
    const materialNamesByCategory =
      categoryParam && categories.includes(categoryParam)
        ? materials.filter((m) => m.category === categoryParam).map((m) => m.name)
        : null;

    const projectWhere = {
      tenantId: tenant.id,
      deletedAt: null,
      ...(projectIdParam ? { id: projectIdParam } : {}),
      ...(clientIdParam ? { clientId: clientIdParam } : {}),
    };

    const itemConditions: Array<{ items: { some: { materials: string | { in: string[] } } } }> = [];
    if (materialNamesByCategory && materialNamesByCategory.length > 0) {
      itemConditions.push({ items: { some: { materials: { in: materialNamesByCategory } } } });
    }
    if (materialName) {
      itemConditions.push({ items: { some: { materials: materialName } } });
    }
    const expenseWhere = {
      tenantId: tenant.id,
      deletedAt: null,
      expenseDate: { gte: monthRange.start, lte: monthRange.end },
      ...(itemConditions.length === 1
        ? itemConditions[0]
        : itemConditions.length > 1
          ? { AND: itemConditions }
          : {}),
    };

    const projectsMatchingFilters = await prisma.project.findMany({
      where: projectWhere,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        budget: true,
        status: true,
        startDate: true,
        endDate: true,
        client: {
          select: { name: true, phone: true, email: true, address: true },
        },
      },
    });

    const projectIds = projectsMatchingFilters.map((p) => p.id);
    const expensesForProjects = await prisma.expense.findMany({
      where: { ...expenseWhere, projectId: { in: projectIds } },
      orderBy: [{ expenseDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        amount: true,
        category: true,
        expenseDate: true,
        projectId: true,
        items: {
          select: { materials: true, quantity: true, unitPrice: true },
        },
      },
    });

    const expensesByProjectId = new Map<string, typeof expensesForProjects>();
    for (const e of expensesForProjects) {
      const list = expensesByProjectId.get(e.projectId) ?? [];
      list.push(e);
      expensesByProjectId.set(e.projectId, list);
    }

    const depositsForProjects = await prisma.projectDeposit.findMany({
      where: {
        projectId: { in: projectIds },
        tenantId: tenant.id,
        paidAt: { gte: monthRange.start, lte: monthRange.end },
      },
      orderBy: { paidAt: "asc" },
      select: {
        id: true,
        amount: true,
        paidAt: true,
        receiptNumber: true,
        reference: true,
        paymentMethod: true,
        accountNo: true,
        projectId: true,
      },
    });
    const depositsByProjectId = new Map<string, typeof depositsForProjects>();
    for (const d of depositsForProjects) {
      const list = depositsByProjectId.get(d.projectId) ?? [];
      list.push(d);
      depositsByProjectId.set(d.projectId, list);
    }

    reportProjects = projectsMatchingFilters.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      location: p.location,
      budget: p.budget,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      client: p.client,
      deposits: (depositsByProjectId.get(p.id) ?? []).map((d) => ({
        id: d.id,
        amount: d.amount,
        paidAt: d.paidAt,
        receiptNumber: d.receiptNumber,
        reference: d.reference,
        paymentMethod: d.paymentMethod,
        accountNo: d.accountNo,
      })),
      expenses: (expensesByProjectId.get(p.id) ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        expenseDate: e.expenseDate,
        items: e.items,
      })),
    }));

    generatedAt = new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
  }

  const fromLabel = fromParam ? new Date(fromParam + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const toLabel = toParam ? new Date(toParam + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const periodLabel = `${fromLabel} – ${toLabel}`;

  const reportDataForExport: ReportProjectExport[] = reportProjects.map((p) => {
    const expenses: ReportProjectExport["expenses"] = [];
    for (const e of p.expenses) {
      const dateStr = new Date(e.expenseDate).toLocaleDateString();
      if (e.items.length > 0) {
        for (const item of e.items) {
          const qty = Number(item.quantity);
          const unitPrice = Number(item.unitPrice);
          expenses.push({
            date: dateStr,
            material: item.materials,
            qty,
            unitPrice,
            amount: qty * unitPrice,
          });
        }
      } else {
        expenses.push({
          date: dateStr,
          material: "—",
          qty: 0,
          unitPrice: 0,
          amount: Number(e.amount),
        });
      }
    }
    const totalExpenses = p.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: p.name,
      clientName: p.client?.name ?? null,
      budget: Number(p.budget),
      received: p.deposits.reduce((sum, d) => sum + Number(d.amount), 0),
      status: p.status,
      startEnd: `${new Date(p.startDate).toLocaleDateString()}${p.endDate ? ` – ${new Date(p.endDate).toLocaleDateString()}` : ""}`,
      expenses,
      totalExpenses,
    };
  });

  return (
    <div className="space-y-8 print:space-y-6" id="report-content">
      <div className="flex flex-col gap-4 print:gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 print:text-xl">
              Financial Report
            </h1>
            {shouldFetchReport ? (
              <>
                <p className="mt-1 text-sm text-slate-500">
                  Period: {fromLabel} – {toLabel}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 print:text-slate-600">
                  Generated on {generatedAt}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                Set date range (from / to month) and click Generate report.
              </p>
            )}
          </div>
          {shouldFetchReport && (
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <ReportPrintButton />
              <ReportExportButtons
                reportData={reportDataForExport}
                periodLabel={periodLabel}
                generatedAt={generatedAt}
              />
            </div>
          )}
        </div>
        <div className="print:hidden">
          <ReportFilters
            projects={projects}
            clients={clients}
            categories={categories}
            materials={materials}
          />
        </div>
      </div>

      {!shouldFetchReport && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-600">
          <p className="font-medium">No report generated yet</p>
          <p className="mt-1 text-sm">Choose a from and to month above and click &quot;Generate report&quot; to load expenses.</p>
        </div>
      )}

      {shouldFetchReport && (
        <>
          <div className="space-y-8 print:space-y-6">
            {reportProjects.map((project) => (
              <section
                key={project.id}
                className="report-project-section rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none print:break-inside-avoid overflow-hidden"
              >
                <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-800">{project.name}</h2>
                  <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2 print:grid-cols-2">
                    <div>
                      <dt className="inline font-medium text-slate-500">Client:</dt>
                      <dd className="inline ml-1 text-slate-800">{project.client?.name ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-500">Status:</dt>
                      <dd className="inline ml-1 text-slate-800">{project.status}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-500">Budget:</dt>
                      <dd className="inline ml-1 text-slate-800">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(project.budget))}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-500">Received:</dt>
                      <dd className="inline ml-1 text-slate-800">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                          project.deposits.reduce((sum, d) => sum + Number(d.amount), 0)
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-500">Start – End:</dt>
                      <dd className="inline ml-1 text-slate-800">
                        {new Date(project.startDate).toLocaleDateString()}
                        {project.endDate ? ` – ${new Date(project.endDate).toLocaleDateString()}` : ""}
                      </dd>
                    </div>
                    {project.location && (
                      <div className="sm:col-span-2">
                        <dt className="inline font-medium text-slate-500">Location:</dt>
                        <dd className="inline ml-1 text-slate-800">{project.location}</dd>
                      </div>
                    )}
                    {project.description && (
                      <div className="sm:col-span-2">
                        <dt className="inline font-medium text-slate-500">Description:</dt>
                        <dd className="inline ml-1 text-slate-800">{project.description}</dd>
                      </div>
                    )}
                    {project.client?.phone && (
                      <div>
                        <dt className="inline font-medium text-slate-500">Client phone:</dt>
                        <dd className="inline ml-1 text-slate-800">{project.client.phone}</dd>
                      </div>
                    )}
                    {project.client?.email && (
                      <div>
                        <dt className="inline font-medium text-slate-500">Client email:</dt>
                        <dd className="inline ml-1 text-slate-800">{project.client.email}</dd>
                      </div>
                    )}
                    {project.client?.address && (
                      <div className="sm:col-span-2">
                        <dt className="inline font-medium text-slate-500">Client address:</dt>
                        <dd className="inline ml-1 text-slate-800">{project.client.address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="border border-slate-200 px-5 py-3 font-semibold text-slate-700 whitespace-nowrap">Date</th>
                        <th className="border border-slate-200 px-5 py-3 font-semibold text-slate-700">Material</th>
                        <th className="border border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Qty</th>
                        <th className="border border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Unit price</th>
                        <th className="border border-slate-200 px-5 py-3 font-semibold text-slate-700 text-right">Amount</th>
                      </tr>
                    </thead>
                    {(() => {
                      const byDate = new Map<string, typeof project.expenses>();
                      for (const e of project.expenses) {
                        const key = new Date(e.expenseDate).toISOString().slice(0, 10);
                        const list = byDate.get(key) ?? [];
                        list.push(e);
                        byDate.set(key, list);
                      }
                      const sortedDates = Array.from(byDate.keys()).sort();
                      const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
                      return sortedDates.map((dateKey) => {
                        const expensesOnDate = byDate.get(dateKey)!;
                        const dateLabel = new Date(dateKey + "Z").toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <tbody key={dateKey} className="report-date-group">
                            <tr>
                              <td colSpan={5} className="border border-slate-200 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-800">
                                {dateLabel}
                              </td>
                            </tr>
                            {expensesOnDate.map((e) => {
                                const rows: React.ReactNode[] = [];
                                if (e.items.length > 0) {
                                  e.items.forEach((item, idx) => {
                                    const lineTotal = Number(item.quantity) * Number(item.unitPrice);
                                    rows.push(
                                      <tr key={`${e.id}-${idx}`}>
                                        <td className="border border-slate-200 px-5 py-2 text-slate-800 whitespace-nowrap">
                                          {" "}
                                        </td>
                                        <td className="border border-slate-200 px-5 py-2 text-slate-700">{item.materials}</td>
                                        <td className="border border-slate-200 px-5 py-2 text-right text-slate-700">
                                          {Number(item.quantity)}
                                        </td>
                                        <td className="border border-slate-200 px-5 py-2 text-right text-slate-700 whitespace-nowrap">
                                          {fmt.format(Number(item.unitPrice))}
                                        </td>
                                        <td className="border border-slate-200 px-5 py-2 text-right font-medium text-slate-900 whitespace-nowrap">
                                          {fmt.format(lineTotal)}
                                        </td>
                                      </tr>
                                    );
                                  }                                  );
                                } else {
                                  rows.push(
                                    <tr key={e.id} className="report-expense-block">
                                      <td className="border border-slate-200 px-5 py-2 text-slate-800 whitespace-nowrap">
                                        {" "}
                                      </td>
                                      <td className="border border-slate-200 px-5 py-2 text-slate-500">—</td>
                                      <td className="border border-slate-200 px-5 py-2 text-right text-slate-500">—</td>
                                      <td className="border border-slate-200 px-5 py-2 text-right text-slate-500">—</td>
                                      <td className="border border-slate-200 px-5 py-2 text-right font-medium text-slate-900 whitespace-nowrap">
                                        {fmt.format(Number(e.amount))}
                                      </td>
                                    </tr>
                                  );
                                }
                              return <React.Fragment key={e.id}>{rows}</React.Fragment>;
                            })}
                          </tbody>
                        );
                      });
                    })()}
                    {project.expenses.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-50/80">
                          <td colSpan={4} className="border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800">
                            Total
                          </td>
                          <td className="border border-slate-200 px-5 py-3 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                              project.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                {project.expenses.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-slate-500">
                    No expenses in this period for this project.
                  </div>
                )}
              </section>
            ))}
          </div>
          {reportProjects.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              <p className="font-medium">No projects or expenses match the selected filters.</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400 print:pt-2">
            This report was generated from Construction Investment Management. Confidential.
          </div>
        </>
      )}
    </div>
  );
}
