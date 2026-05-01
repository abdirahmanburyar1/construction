import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createTenant } from "../actions";

export default async function NewTenantPage() {
  const plans = await prisma.plan.findMany({ where: { isActive: true } });

  return (
    <div className="">
      <div className="mb-8">
        <Link
          href="/tenants"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to Tenants
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add New Tenant</h1>
        <p className="mt-1 text-sm text-slate-500">Register a new customer company on the platform</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={createTenant} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2 p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
              <h3 className="sm:col-span-2 text-sm font-black uppercase tracking-widest text-slate-400">Initial Admin User</h3>
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  id="adminEmail"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-slate-700">
                  Admin Password
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  id="adminPassword"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700">
                Subdomain
              </label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <input
                  type="text"
                  name="subdomain"
                  id="subdomain"
                  required
                  className="block w-full rounded-l-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                  .dhisme.so
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">
                Initial Status
              </label>
              <select
                name="status"
                id="status"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              >
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="planId" className="block text-sm font-medium text-slate-700">
                Subscription Plan
              </label>
              <select
                name="planId"
                id="planId"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${Number(plan.priceMonthly)}/mo
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="maxCompanies" className="block text-sm font-medium text-slate-700">
                Max Companies
              </label>
              <input
                type="number"
                name="maxCompanies"
                id="maxCompanies"
                defaultValue={1}
                min={1}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-teal-50 bg-teal-50/30">
              <input
                type="checkbox"
                name="hasMultipleCompanies"
                id="hasMultipleCompanies"
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="hasMultipleCompanies" className="text-sm font-semibold text-teal-900">
                Has multiple companies
              </label>
              <p className="text-xs text-teal-600 ml-auto">Enables advanced multi-company features</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/tenants"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Create Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
