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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
        <Link href="/admin/tenants/new" className="btn btn-primary">
          Create tenant
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Slug (subdomain)</th>
              <th>Email</th>
              <th>Status</th>
              <th>Start</th>
              <th>Expiry</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td className="font-medium text-slate-800">{t.companyName}</td>
                <td>{t.slug}</td>
                <td>{t.email}</td>
                <td>{t.subscriptionStatus}</td>
                <td>{t.subscriptionStartDate ? new Date(t.subscriptionStartDate).toLocaleDateString() : "—"}</td>
                <td>{t.subscriptionExpiryDate ? new Date(t.subscriptionExpiryDate).toLocaleDateString() : "—"}</td>
                <td>
                  <Link href={`/admin/tenants/${t.id}/edit`} className="text-teal-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
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
