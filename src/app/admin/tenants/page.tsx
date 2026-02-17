import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/admin/login");

  const { page = "1" } = await searchParams;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const skip = (current - 1) * PAGE_SIZE;

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      take: PAGE_SIZE,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        slug: true,
        email: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionExpiryDate: true,
        createdAt: true,
      },
    }),
    prisma.tenant.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const platformDomain = process.env.PLATFORM_DOMAIN || "dhisme.so";
  const isProduction = !platformDomain.includes("localhost");
  const baseUrl = `${isProduction ? "https" : "http"}://`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500">Subdomain per tenant (e.g. {baseUrl}[slug].{platformDomain})</p>
        </div>
        <Link href="/admin/tenants/new" className="shrink-0 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700">
          Create tenant
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Company</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Slug</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Tenant URL</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Email</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Status</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Start</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Expiry</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => {
              const tenantUrl = `${baseUrl}${t.slug}.${platformDomain}`;
              return (
                <tr key={t.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{t.companyName}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.slug}</td>
                  <td className="px-5 py-3.5">
                    <a href={tenantUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:text-teal-700">
                      {tenantUrl}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{t.email}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.subscriptionStatus}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.subscriptionStartDate ? new Date(t.subscriptionStartDate).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.subscriptionExpiryDate ? new Date(t.subscriptionExpiryDate).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/tenants/${t.id}/edit`} className="font-medium text-teal-600 hover:text-teal-700">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2">
          {current > 1 && (
            <Link href={`/admin/tenants?page=${current - 1}`} className="btn btn-secondary">
              Previous
            </Link>
          )}
          <span className="py-2 text-sm text-slate-600">
            Page {current} of {totalPages}
          </span>
          {current < totalPages && (
            <Link href={`/admin/tenants?page=${current + 1}`} className="btn btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
