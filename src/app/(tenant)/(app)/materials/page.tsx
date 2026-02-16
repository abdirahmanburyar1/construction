import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { page = "1" } = await searchParams;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const skip = (current - 1) * PAGE_SIZE;

  const [materials, total] = await Promise.all([
    prisma.material.findMany({
      where: { tenantId: tenant.id },
      take: PAGE_SIZE,
      skip,
      orderBy: { purchasedAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.material.count({ where: { tenantId: tenant.id } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Materials</h1>
          <p className="page-subtitle">Purchase records and costs per project</p>
        </div>
        <Link href="/materials/new" className="btn btn-primary shrink-0">
          Add material
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Project</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Unit price</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td className="font-medium text-slate-800">{m.name}</td>
                <td>
                  <Link href={`/projects/${m.projectId}`} className="text-teal-600 hover:underline">
                    {m.project.name}
                  </Link>
                </td>
                <td>{String(m.quantity)}</td>
                <td>{m.unit}</td>
                <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(m.unitPrice))}</td>
                <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(m.totalPrice))}</td>
                <td>{new Date(m.purchasedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          {current > 1 && (
            <Link href={`/materials?page=${current - 1}`} className="btn btn-secondary">
              Previous
            </Link>
          )}
          <span className="py-2 text-sm text-slate-600">
            Page {current} of {totalPages}
          </span>
          {current < totalPages && (
            <Link href={`/materials?page=${current + 1}`} className="btn btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
