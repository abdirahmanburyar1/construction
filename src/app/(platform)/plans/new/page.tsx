import Link from "next/link";
import { createPlan } from "../actions";

export default function NewPlanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/plans"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to Plans
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create Subscription Plan</h1>
        <p className="mt-1 text-sm text-slate-500">Define a new pricing tier for your customers</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={createPlan} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Plan Name</label>
              <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" placeholder="e.g. Pro" />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700">Slug</label>
              <input type="text" name="slug" id="slug" required className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" placeholder="e.g. pro" />
            </div>

             <div className="flex items-center gap-3 pt-7">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
            </div>

            <div>
              <label htmlFor="priceMonthly" className="block text-sm font-medium text-slate-700">Price (Monthly)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input type="number" step="0.01" name="priceMonthly" id="priceMonthly" required className="block w-full pl-7 rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" placeholder="0.00" />
              </div>
            </div>

            <div>
              <label htmlFor="priceYearly" className="block text-sm font-medium text-slate-700">Price (Yearly)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input type="number" step="0.01" name="priceYearly" id="priceYearly" className="block w-full pl-7 rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" placeholder="0.00" />
              </div>
            </div>

            <div>
              <label htmlFor="maxProjects" className="block text-sm font-medium text-slate-700">Max Projects</label>
              <input type="number" name="maxProjects" id="maxProjects" required className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-slate-700">Max Users</label>
              <input type="number" name="maxUsers" id="maxUsers" required className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="maxStorageMB" className="block text-sm font-medium text-slate-700">Max Storage (MB)</label>
              <input type="number" name="maxStorageMB" id="maxStorageMB" required className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link href="/plans" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
            <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">Create Plan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
