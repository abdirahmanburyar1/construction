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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
        <Link href="/projects" className="btn btn-secondary">
          ← Projects
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Materials cost</p>
          <p className="text-xl font-semibold text-slate-800">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalMaterials)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Expenses</p>
          <p className="text-xl font-semibold text-slate-800">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalExpenses)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total investment</p>
          <p className="text-xl font-semibold text-teal-700">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvestment)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Edit project</h2>
        <ProjectForm project={project} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Materials</h2>
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
            <h2 className="text-lg font-semibold text-slate-800">Expenses</h2>
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
