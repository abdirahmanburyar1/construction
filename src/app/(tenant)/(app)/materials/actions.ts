"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

export async function createMaterialAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim();

  if (!name || !unit) return { error: "Name and unit required" };

  const existing = await prisma.materialCatalog.findFirst({
    where: { tenantId: tenant.id, name },
  });
  if (existing) return { error: "A material with this name already exists" };

  await prisma.materialCatalog.create({
    data: {
      tenantId: tenant.id,
      name,
      unit,
    },
  });
  revalidatePath("/materials");
  redirect("/materials");
}
