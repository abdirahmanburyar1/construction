import React from "react";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ReportFilters } from "../report-filters";
import { ReportPrintButton } from "../report-print-button";
import { ReportProfitLoss } from "../report-profit-loss";

function parseMonthRange(fromParam: string, toParam: string): { start: Date; end: Date } | null {
  if (!fromParam || !toParam) return null;
  const [fromY, fromM] = fromParam.split("-").map(Number);
  const [toY, toM] = toParam.split("-").map(Number);
  if (!fromY || !fromM || !toY || !toM) return null;
  const start = new Date(fromY, fromM - 1, 1, 0, 0, 0, 0);
  const end = new Date(toY, toM, 0, 23, 59, 59, 999);
  return start <= end ? { start, end } : null;
}

export default async function ProfitLossReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; projectId?: string; clientId?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const params = await searchParams;
  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const fromParam = toStr(params.from);
  const toParam = toStr(params.to);
  const projectIdParam = toStr(params.projectId);
  const clientIdParam = toStr(params.clientId);

  const [projects, clients] = await Promise.all([
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
  ]);

  const materials = await prisma.materialCatalog.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true },
  });
  const categories = Array.from(new Set(materials.map((m) => m.category).filter(Boolean))) as string[];
  categories.sort();

  const monthRange = parseMonthRange(fromParam, toParam);
  const shouldFetchReport = monthRange !== null;

  let pnlData: { income: number; expensesByCategory: { category: string; amount: number }[]; totalExpenses: number; netProfit: number } | null = null;
  let generatedAt = "";

  if (shouldFetchReport && monthRange) {
    const projectWhere = {
      tenantId: tenant.id,
      deletedAt: null,
      ...(projectIdParam ? { id: projectIdParam } : {}),
      ...(clientIdParam ? { clientId: clientIdParam } : {}),
    };
    const projectsMatching = await prisma.project.findMany({
      where: projectWhere,
      select: { id: true },
    });
    const projectIds = projectsMatching.map((p) => p.id);

    const [depositsInPeriod, expensesInPeriod] = await Promise.all([
      projectIds.length > 0
        ? prisma.projectDeposit.findMany({
            where: {
              tenantId: tenant.id,
              projectId: { in: projectIds },
              paidAt: { gte: monthRange.start, lte: monthRange.end },
            },
            select: { amount: true },
          })
        : [],
      projectIds.length > 0
        ? prisma.expense.findMany({
            where: {
              tenantId: tenant.id,
              deletedAt: null,
              projectId: { in: projectIds },
              expenseDate: { gte: monthRange.start, lte: monthRange.end },
              project: { deletedAt: null },
            },
            select: { amount: true, category: true },
          })
        : [],
    ]);

    const income = depositsInPeriod.reduce((sum, d) => sum + Number(d.amount), 0);
    const byCategory = new Map<string, number>();
    for (const e of expensesInPeriod) {
      const amt = Number(e.amount);
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + amt);
    }
    const totalExpenses = expensesInPeriod.reduce((sum, e) => sum + Number(e.amount), 0);
    const order = ["MATERIAL", "LABOR", "EQUIPMENT", "SUBCONTRACT", "OTHER"];
    const expensesByCategory = order
      .filter((c) => byCategory.has(c))
      .map((category) => ({ category, amount: byCategory.get(category)! }));
    pnlData = {
      income,
      expensesByCategory,
      totalExpenses,
      netProfit: income - totalExpenses,
    };
    generatedAt = new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
  }

  const fromLabel = fromParam ? new Date(fromParam + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const toLabel = toParam ? new Date(toParam + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
  const periodLabel = `${fromLabel} – ${toLabel}`;

  return (
    <div className="space-y-8 print:space-y-6" id="report-content">
      <div className="flex flex-col gap-4 print:gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 print:text-xl">Profit and Loss</h1>
            {shouldFetchReport ? (
              <p className="mt-1 text-sm text-slate-500">Period: {periodLabel}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Set date range and click Generate report.</p>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Back to Reports
            </Link>
            {shouldFetchReport && <ReportPrintButton />}
          </div>
        </div>
        <div className="print:hidden">
          <ReportFilters
            basePath="/reports/profit-loss"
            projects={projects}
            clients={clients}
            categories={categories}
            materials={materials.map((m) => ({ id: m.id, name: m.name, category: m.category }))}
            showCategoryMaterial={false}
          />
        </div>
      </div>

      {!shouldFetchReport && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-600">
          <p className="font-medium">No report generated yet</p>
          <p className="mt-1 text-sm">Choose from and to month above and click Generate report.</p>
        </div>
      )}

      {shouldFetchReport && pnlData && (
        <ReportProfitLoss data={pnlData} periodLabel={periodLabel} generatedAt={generatedAt} />
      )}
    </div>
  );
}
