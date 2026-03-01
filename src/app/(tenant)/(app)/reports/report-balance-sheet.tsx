import React from "react";

export type BalanceSheetData = {
  totalBudget: number;
  totalReceived: number;
  totalExpenses: number;
  receivables: number;
  netPosition: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function ReportBalanceSheet({
  data,
  asAtLabel,
  generatedAt,
}: {
  data: BalanceSheetData;
  asAtLabel: string;
  generatedAt: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:shadow-none">
      <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Balance Sheet</h2>
        <p className="mt-1 text-sm text-slate-500">As at {asAtLabel}</p>
        <p className="mt-0.5 text-xs text-slate-400">Generated on {generatedAt}</p>
      </div>
      <div className="p-6">
        <table className="w-full max-w-xl text-left text-sm">
          <tbody>
            {/* Assets */}
            <tr>
              <td colSpan={2} className="pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assets
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pl-4 text-slate-700">Received from clients (deposits)</td>
              <td className="py-1.5 text-right font-medium text-slate-900 tabular-nums">{fmt(data.totalReceived)}</td>
            </tr>
            <tr>
              <td className="py-1.5 pl-4 text-slate-700">Receivables (contract value not yet received)</td>
              <td className="py-1.5 text-right font-medium text-slate-900 tabular-nums">{fmt(data.receivables)}</td>
            </tr>
            <tr>
              <td className="py-2 pl-4 font-semibold text-slate-800">Total Assets</td>
              <td className="py-2 text-right font-semibold text-slate-900 tabular-nums border-b border-slate-200">
                {fmt(data.totalReceived + data.receivables)}
              </td>
            </tr>

            {/* Equity */}
            <tr>
              <td colSpan={2} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Equity
              </td>
            </tr>
            <tr>
              <td className="py-1.5 pl-4 text-slate-700">Total contract value (budget)</td>
              <td className="py-1.5 text-right text-slate-800 tabular-nums">{fmt(data.totalBudget)}</td>
            </tr>
            <tr>
              <td className="py-1.5 pl-4 text-slate-700">Less: Costs incurred</td>
              <td className="py-1.5 text-right text-slate-800 tabular-nums">({fmt(data.totalExpenses)})</td>
            </tr>
            <tr>
              <td className="py-2 pl-4 font-semibold text-slate-800">Net position</td>
              <td className={`py-2 text-right font-semibold tabular-nums border-b border-slate-200 ${data.netPosition >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {fmt(data.netPosition)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
