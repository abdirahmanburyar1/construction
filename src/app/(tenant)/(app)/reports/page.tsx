import Link from "next/link";

const REPORTS = [
  {
    href: "/reports/financial",
    title: "Financial Report",
    description: "Expenses by project with budget, received, and line-item detail. Filter by period, client, project, category, and material.",
  },
  {
    href: "/reports/profit-loss",
    title: "Profit & Loss",
    description: "Income (deposits received) and cost of sales by category for a period. Net profit summary.",
  },
  {
    href: "/reports/balance-sheet",
    title: "Balance Sheet",
    description: "Assets (received, receivables) and equity (contract value, costs, net position) as at a date.",
  },
] as const;

export default function ReportsIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a report to run.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700">{r.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{r.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-teal-600 group-hover:text-teal-700">
              Open report →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
