import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTenant } from "../../actions";

export default async function EditTenantPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      plan: true,
      tenantFeatureOverrides: true,
    },
  });

  if (!tenant) notFound();

  const plans = await prisma.plan.findMany({ where: { isActive: true } });
  const allFeatures = await prisma.feature.findMany();

  const updateTenantWithId = updateTenant.bind(null, tenant.id);

  return (
    <div className="">
      <div className="mb-8">
        <Link
          href="/tenants"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to Tenants
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Tenant: {tenant.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Update company details and toggle enabled modules</p>
      </div>

      <form action={updateTenantWithId} className="space-y-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 font-display">General Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={tenant.name}
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Subdomain</label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <input
                  type="text"
                  disabled
                  value={tenant.subdomain}
                  className="block w-full rounded-l-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:text-sm cursor-not-allowed"
                />
                <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                  .dhisme.so
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 italic">Subdomain cannot be changed after creation</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                defaultValue={tenant.status}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              >
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="planId" className="block text-sm font-medium text-slate-700">
                Subscription Plan
              </label>
              <select
                name="planId"
                id="planId"
                defaultValue={tenant.planId || ""}
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
                defaultValue={tenant.maxCompanies || 1}
                min={1}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 font-display">Module Management (Overrides)</h2>
          <p className="text-sm text-slate-500 mb-6">
            Force enable or disable specific modules for this tenant, regardless of their plan.
          </p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {allFeatures.map((feature) => {
              const override = tenant.tenantFeatureOverrides.find(o => o.featureId === feature.id);
              const isEnabled = override ? override.enabled : false;

              return (
                <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{feature.name}</p>
                    <p className="text-xs text-slate-500">{feature.key}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name={`feature_${feature.key}`}
                      defaultChecked={isEnabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Link
            href="/tenants"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
