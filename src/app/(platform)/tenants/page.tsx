import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all registered customer companies</p>
        </div>
        <Link
          href="/tenants/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Add New Tenant
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900">Company Name</th>
              <th className="px-6 py-4 font-semibold text-slate-900">Subdomain</th>
              <th className="px-6 py-4 font-semibold text-slate-900">Plan</th>
              <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{tenant.name}</td>
                <td className="px-6 py-4 text-slate-600">{tenant.subdomain}.dhisme.so</td>
                <td className="px-6 py-4 text-slate-600">{tenant.plan?.name ?? "No Plan"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    tenant.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                    tenant.status === "TRIAL" ? "bg-blue-50 text-blue-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/tenants/${tenant.id}/edit`}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/20">
                    No tenants found. Get started by adding your first customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
