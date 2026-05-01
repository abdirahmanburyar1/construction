import { notFound } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
=======
import { getTenantForRequest } from "@/lib/tenant-context";
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../../project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
<<<<<<< HEAD
  const { id } = await params;
  const [project, clients, companies] = await Promise.all([
    prisma.project.findFirst({ where: { id } }),
    prisma.client.findMany({ select: { id: true, name: true } }),
    prisma.company.findMany({ select: { id: true, name: true, isDefault: true } }),
=======
  const tenant = await getTenantForRequest();
  const { id } = await params;
  const [project, clients, companies] = await Promise.all([
    prisma.project.findFirst({ where: { id, tenantId: tenant.id } }),
    prisma.client.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true, isDefault: true } }),
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Edit project</h1>
        <Link href={`/projects/${id}`} className="btn btn-secondary">
          ← Back
        </Link>
      </div>
      <ProjectForm project={project} clients={clients} companies={companies} />
    </div>
  );
}
