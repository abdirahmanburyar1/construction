<<<<<<< HEAD
=======
import { getTenantForRequest } from "@/lib/tenant-context";
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
import { prisma } from "@/lib/prisma";
import { MaterialForm } from "../material-form";

export default async function NewMaterialPage() {
<<<<<<< HEAD
  const rows = await prisma.materialCatalog.findMany({
    where: { category: { not: null } },
=======
  const tenant = await getTenantForRequest();
  const rows = await prisma.materialCatalog.findMany({
    where: { tenantId: tenant.id, category: { not: null } },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = rows.map((r) => r.category).filter((c): c is string => c != null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add material to catalog</h1>
      <MaterialForm initialCategories={categories} />
    </div>
  );
}
