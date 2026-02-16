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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
        <Link href="/projects/new" className="btn btn-primary">
          New project
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Estimated budget</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-slate-800">{p.name}</td>
                <td>{p.status}</td>
                <td>
                  {p.estimatedBudget != null
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(p.estimatedBudget))
                    : "—"}
                </td>
                <td>
                  <Link href={`/projects/${p.id}`} className="text-teal-600 hover:underline">
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
