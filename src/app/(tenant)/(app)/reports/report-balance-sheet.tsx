import React from "react";

export type BalanceSheetData = {
  totalBudget: number;
  totalReceived: number;
  totalExpenses: number;
  receivables: number;
  netPosition: number;
  fixedAssetsTotal: number;
  currentAssetsTotal: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function ReportBalanceSheet({
  data,
  asAtLabel,
  generatedAt,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  data: BalanceSheetData;
  asAtLabel: string;
  generatedAt: string;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  const currentAssetsSubtotal =
    data.totalReceived + data.receivables + data.currentAssetsTotal;
  const totalAssets =
    currentAssetsSubtotal + data.fixedAssetsTotal;
  const totalLiabilities = 0;
  const nonCurrentLiabilities = 0;
  const currentLiabilities = totalLiabilities - nonCurrentLiabilities;
  const unallocatedEarnings = data.netPosition;
  const previousUnallocated = 0;
  const currentYearUnallocated = unallocatedEarnings - previousUnallocated;
  const totalEquity = totalAssets - totalLiabilities;
  const retainedEarningsTotal = Math.max(0, totalEquity - unallocatedEarnings);
  const currentYearRetained = 0;
  const previousYearsRetained = retainedEarningsTotal;
  const liabilitiesPlusEquity = totalLiabilities + totalEquity;

  const sectionHeader = "bg-slate-100 font-bold uppercase tracking-wide text-slate-800";
  const subSectionHeader = "font-bold text-slate-800";
  const rowLabel = "py-1.5 pl-4 text-slate-700 border-b border-slate-100";
  const rowLabelIndent = "py-1.5 pl-8 text-slate-600 border-b border-slate-100";
  const rowValue = "py-1.5 pr-4 text-right tabular-nums text-slate-900 border-b border-slate-100";
  const totalRow = "border-b-2 border-slate-300 font-semibold text-slate-900";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none print:rounded-none print:border-slate-300">
      {/* Header with tenant branding */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-5 print:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:gap-2">
          <div className="flex-shrink-0">
            {tenantLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenantLogoUrl}
                alt="Company logo"
                className="h-14 w-14 object-contain object-left sm:h-16 sm:w-16 print:h-12 print:w-12"
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded border border-slate-200 bg-white sm:h-16 sm:w-16 print:h-12 print:w-12">
                <span className="text-xs font-medium text-slate-400">Logo</span>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center text-center sm:items-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 print:text-lg">
              BALANCE SHEET
            </h1>
            <p className="mt-1 text-sm font-medium text-teal-700">As at {asAtLabel}</p>
            <p className="mt-0.5 text-xs text-slate-500 print:hidden">Generated on {generatedAt}</p>
          </div>
          <div className="flex-shrink-0 text-right sm:max-w-[220px]">
            <p className="font-semibold text-slate-800">{tenantName}</p>
            {tenantBusinessInfo && (
              <p className="mt-1 text-xs leading-snug text-slate-600">
                {tenantBusinessInfo}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 print:p-5">
        <table className="w-full max-w-2xl border-collapse text-left text-sm">
          <tbody>
            {/* ASSETS */}
            <tr>
              <td className={`${sectionHeader} py-2.5 pl-4 pr-4`}>Assets</td>
              <td className={`${sectionHeader} py-2.5 text-right pr-4 tabular-nums`}>
                {fmt(totalAssets)}
              </td>
            </tr>
            <tr>
              <td className={`${subSectionHeader} ${rowLabel} pl-6`}>Current Assets</td>
              <td className={`${rowValue} font-semibold`}>{fmt(currentAssetsSubtotal)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Bank and Cash Accounts</td>
              <td className={rowValue}>{fmt(data.totalReceived)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Receivables</td>
              <td className={rowValue}>{fmt(data.receivables)}</td>
            </tr>
            {data.currentAssetsTotal > 0 && (
              <tr>
                <td className={rowLabelIndent}>Other Current Assets</td>
                <td className={rowValue}>{fmt(data.currentAssetsTotal)}</td>
              </tr>
            )}
            <tr>
              <td className={rowLabelIndent}>Prepayments</td>
              <td className={rowValue}>{fmt(0)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Plus Fixed Assets</td>
              <td className={rowValue}>{fmt(data.fixedAssetsTotal)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Plus Non-current Assets</td>
              <td className={rowValue}>{fmt(0)}</td>
            </tr>

            {/* LIABILITIES */}
            <tr>
              <td className={`${sectionHeader} pt-5 pb-2.5 pl-4 pr-4`}>Liabilities</td>
              <td className={`${sectionHeader} pt-5 pb-2.5 text-right pr-4 tabular-nums`}>
                {fmt(totalLiabilities)}
              </td>
            </tr>
            <tr>
              <td className={`${subSectionHeader} ${rowLabel} pl-6`}>Current Liabilities</td>
              <td className={`${rowValue} font-semibold`}>{fmt(currentLiabilities)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Payables</td>
              <td className={rowValue}>{fmt(0)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Plus Non-current Liabilities</td>
              <td className={rowValue}>{fmt(nonCurrentLiabilities)}</td>
            </tr>

            {/* EQUITY */}
            <tr>
              <td className={`${sectionHeader} pt-5 pb-2.5 pl-4 pr-4`}>Equity</td>
              <td className={`${sectionHeader} pt-5 pb-2.5 text-right pr-4 tabular-nums`}>
                {fmt(totalEquity)}
              </td>
            </tr>
            <tr>
              <td className={`${subSectionHeader} ${rowLabel} pl-6`}>Unallocated Earnings</td>
              <td className={`${rowValue} font-semibold`}>{fmt(unallocatedEarnings)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Current Year Unallocated Earnings</td>
              <td className={rowValue}>{fmt(currentYearUnallocated)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Previous Years Unallocated Earnings</td>
              <td className={rowValue}>{fmt(previousUnallocated)}</td>
            </tr>
            <tr>
              <td className={`${subSectionHeader} ${rowLabel} pl-6`}>Retained Earnings</td>
              <td className={`${rowValue} font-semibold`}>{fmt(retainedEarningsTotal)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Current Year Retained Earnings</td>
              <td className={rowValue}>{fmt(currentYearRetained)}</td>
            </tr>
            <tr>
              <td className={rowLabelIndent}>Previous Years Retained Earnings</td>
              <td className={rowValue}>{fmt(previousYearsRetained)}</td>
            </tr>

            {/* LIABILITIES + EQUITY */}
            <tr>
              <td className={`${sectionHeader} pt-5 pb-3 pl-4 pr-4 border-b-2 border-slate-300`}>
                Liabilities + Equity
              </td>
              <td className={`${sectionHeader} pt-5 pb-3 text-right pr-4 tabular-nums border-b-2 border-slate-300`}>
                {fmt(liabilitiesPlusEquity)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
