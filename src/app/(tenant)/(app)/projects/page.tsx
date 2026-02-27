import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { page = "1" } = await searchParams;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const skip = (current - 1) * PAGE_SIZE;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      skip,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.count({ where: { tenantId: tenant.id } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Track budgets and investment per project</p>
        </div>
        <Link href="/projects/new" className="shrink-0 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700">
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Name</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Status</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700">Budget</th>
              <th className="px-5 py-3.5 font-semibold text-slate-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                <td className="px-5 py-3.5 text-slate-600">{p.status}</td>
                <td className="px-5 py-3.5 text-slate-600">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(p.budget))}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/projects/${p.id}`} className="font-medium text-teal-600 hover:text-teal-700">
                    View
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
            <Link href={`/projects?page=${current - 1}`} className="btn btn-secondary">
              Previous
            </Link>
          )}
          <span className="py-2 text-sm text-slate-600">
            Page {current} of {totalPages}
          </span>
          {current < totalPages && (
            <Link href={`/projects?page=${current + 1}`} className="btn btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
