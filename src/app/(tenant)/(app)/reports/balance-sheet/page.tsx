import React from "react";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ReportFilters } from "../report-filters";
import { ReportPrintButton } from "../report-print-button";
import { ReportBalanceSheet } from "../report-balance-sheet";

function parseMonthRange(fromParam: string, toParam: string): { start: Date; end: Date } | null {
  if (!fromParam || !toParam) return null;
  const [fromY, fromM] = fromParam.split("-").map(Number);
  const [toY, toM] = toParam.split("-").map(Number);
  if (!fromY || !fromM || !toY || !toM) return null;
  const start = new Date(fromY, fromM - 1, 1, 0, 0, 0, 0);
  const end = new Date(toY, toM, 0, 23, 59, 59, 999);
  return start <= end ? { start, end } : null;
}

export default async function BalanceSheetReportPage({
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

  let balanceSheetData: {
    totalBudget: number;
    totalReceived: number;
    totalExpenses: number;
    receivables: number;
    netPosition: number;
    fixedAssetsTotal: number;
    currentAssetsTotal: number;
  } | null = null;
  let generatedAt = "";
  let asAtLabel = "";

  if (shouldFetchReport && monthRange) {
    const projectWhere = {
      tenantId: tenant.id,
      deletedAt: null,
      ...(projectIdParam ? { id: projectIdParam } : {}),
      ...(clientIdParam ? { clientId: clientIdParam } : {}),
    };
    const projectsMatching = await prisma.project.findMany({
      where: projectWhere,
      select: { id: true, budget: true },
    });
    const projectIds = projectsMatching.map((p) => p.id);
    const totalBudget = projectsMatching.reduce((sum, p) => sum + Number(p.budget), 0);

    const [receivedAgg, expensesAgg] = await Promise.all([
      projectIds.length > 0
        ? prisma.projectDeposit.aggregate({
            where: {
              tenantId: tenant.id,
              projectId: { in: projectIds },
              paidAt: { lte: monthRange.end },
            },
            _sum: { amount: true },
          })
        : { _sum: { amount: null as number | null } },
      projectIds.length > 0
        ? prisma.expense.aggregate({
            where: {
              tenantId: tenant.id,
              deletedAt: null,
              projectId: { in: projectIds },
              expenseDate: { lte: monthRange.end },
              project: { deletedAt: null },
            },
            _sum: { amount: true },
          })
        : { _sum: { amount: null as number | null } },
    ]);

    const totalReceived = Number(receivedAgg._sum.amount ?? 0);
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);

    const assets = await prisma.asset.findMany({
      where: { tenantId: tenant.id },
      select: { category: true, cost: true },
    });
    let fixedAssetsTotal = 0;
    let currentAssetsTotal = 0;
    for (const a of assets) {
      const cost = Number(a.cost);
      if (a.category === "FIXED") fixedAssetsTotal += cost;
      else if (a.category === "CURRENT") currentAssetsTotal += cost;
    }

    balanceSheetData = {
      totalBudget,
      totalReceived,
      totalExpenses,
      receivables: Math.max(0, totalBudget - totalReceived),
      netPosition: totalBudget - totalExpenses,
      fixedAssetsTotal,
      currentAssetsTotal,
    };
    generatedAt = new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
    asAtLabel = new Date(monthRange.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-8 print:space-y-6" id="report-content">
      <div className="flex flex-col gap-4 print:gap-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 print:text-xl">Balance Sheet</h1>
            {shouldFetchReport ? (
              <p className="mt-1 text-sm text-slate-500">As at end of period</p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Set date range and click Generate report.</p>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Reports
            </Link>
            {shouldFetchReport && <ReportPrintButton />}
          </div>
        </div>
        <div className="print:hidden">
          <ReportFilters
            basePath="/reports/balance-sheet"
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
          <p className="mt-1 text-sm">Choose from and to month above and click &quot;Generate report&quot;.</p>
        </div>
      )}

      {shouldFetchReport && balanceSheetData && (
        <ReportBalanceSheet data={balanceSheetData} asAtLabel={asAtLabel} generatedAt={generatedAt} />
      )}
    </div>
  );
}
