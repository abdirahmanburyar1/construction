import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenantForRequest();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      materials: true,
      expenses: true,
    },
  });
  if (!project) notFound();

  const totalMaterials = project.materials.reduce((s, m) => s + Number(m.totalPrice), 0);
  const totalExpenses = project.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalInvestment = totalMaterials + totalExpenses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">{project.name}</h1>
        <Link href="/projects" className="btn btn-secondary shrink-0">
          ← Projects
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="stat-card">
          <span className="stat-label">Materials cost</span>
          <span className="stat-value">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalMaterials)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Expenses</span>
          <span className="stat-value">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total investment</span>
          <span className="stat-value-accent">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvestment)}
          </span>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Edit project</h2>
        <ProjectForm project={project} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="card-header">Materials</h2>
            <Link href={`/materials/new?projectId=${project.id}`} className="btn btn-primary text-sm">
              Add
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {project.materials.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{String(m.quantity)}</td>
                    <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(m.unitPrice))}</td>
                    <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(m.totalPrice))}</td>
                  </tr>
                ))}
                {project.materials.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-slate-500">
                      No materials
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="card-header">Expenses</h2>
            <Link href={`/expenses/new?projectId=${project.id}`} className="btn btn-primary text-sm">
              Add
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {project.expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.category}</td>
                    <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(e.amount))}</td>
                    <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {project.expenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-slate-500">
                      No expenses
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
