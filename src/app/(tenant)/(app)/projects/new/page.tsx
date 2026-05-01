import Link from "next/link";
<<<<<<< HEAD
=======
import { getTenantForRequest } from "@/lib/tenant-context";
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
<<<<<<< HEAD
  const [clients, companies] = await Promise.all([
    prisma.client.findMany({
=======
  const tenant = await getTenantForRequest();
  const [clients, companies] = await Promise.all([
    prisma.client.findMany({
      where: { tenantId: tenant.id },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.company.findMany({
<<<<<<< HEAD
=======
      where: { tenantId: tenant.id },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      select: { id: true, name: true, isDefault: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/projects"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          ← Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New project
        </h1>
        <p className="text-sm text-slate-500">
          Add a new project with name, client, budget, and dates.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Project details</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Name, description, location, and client
          </p>
        </div>
        <div className="p-6">
          <ProjectForm clients={clients} companies={companies} />
        </div>
      </div>
    </div>
  );
}
