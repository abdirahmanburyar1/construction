import React from "react";

const CATEGORY_LABELS: Record<string, string> = {
  MATERIAL: "Materials",
  LABOR: "Labor",
  EQUIPMENT: "Equipment",
  SUBCONTRACT: "Subcontract",
  OTHER: "Other",
};

export type PnLData = {
  income: number;
  expensesByCategory: { category: string; amount: number }[];
  totalExpenses: number;
  netProfit: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function ReportProfitLoss({
  data,
  periodLabel,
  generatedAt,
}: {
  data: PnLData;
  periodLabel: string;
  generatedAt: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:shadow-none">
      <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Profit &amp; Loss</h2>
        <p className="mt-1 text-sm text-slate-500">Period: {periodLabel}</p>
        <p className="mt-0.5 text-xs text-slate-400">Generated on {generatedAt}</p>
      </div>
      <div className="p-6">
        <table className="w-full max-w-xl text-left text-sm">
          <tbody>
            {/* Income section */}
            <tr>
              <td colSpan={2} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Income
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pl-4 text-slate-700">Deposits received</td>
              <td className="py-1.5 text-right font-medium text-slate-900 tabular-nums">{fmt(data.income)}</td>
            </tr>
            <tr>
              <td className="py-2 pl-4 font-semibold text-slate-800">Total Income</td>
              <td className="py-2 text-right font-semibold text-slate-900 tabular-nums border-b border-slate-200">{fmt(data.income)}</td>
            </tr>

            {/* Cost of sales / Expenses */}
            <tr>
              <td colSpan={2} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cost of Sales
              </td>
            </tr>
            {data.expensesByCategory.map(({ category, amount }) => (
              <tr key={category}>
                <td className="py-1.5 pl-4 text-slate-700">{CATEGORY_LABELS[category] ?? category}</td>
                <td className="py-1.5 text-right text-slate-800 tabular-nums">({fmt(amount)})</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pl-4 font-semibold text-slate-800">Total Cost of Sales</td>
              <td className="py-2 text-right font-semibold text-slate-900 tabular-nums border-b border-slate-200">({fmt(data.totalExpenses)})</td>
            </tr>

            {/* Net profit */}
            <tr>
              <td className="py-4 font-bold text-slate-900">Net Profit</td>
              <td className={`py-4 text-right font-bold tabular-nums ${data.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {fmt(data.netProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
