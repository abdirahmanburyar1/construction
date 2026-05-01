import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createPlan, deletePlan } from "./actions";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-slate-500">Define and manage pricing tiers for your tenants</p>
        </div>
        <Link
          href="/plans/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Add New Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${plan.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-6">
              ${Number(plan.priceMonthly)}<span className="text-sm font-normal text-slate-500">/mo</span>
            </p>
            
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center">
                <CheckIcon className="h-4 w-4 text-teal-500 mr-2" />
                Up to {plan.maxProjects} projects
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-4 w-4 text-teal-500 mr-2" />
                Up to {plan.maxUsers} users
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-4 w-4 text-teal-500 mr-2" />
                {plan.maxStorageMB / 1024}GB Storage
              </li>
            </ul>

            <div className="flex items-center justify-end border-t border-slate-100 pt-4">
              {/* Delete action as a button for simplicity in this listing */}
              <form action={async () => {
                "use server";
                await deletePlan(plan.id);
              }}>
                <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-700">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                No plans found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
