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
  const projectId = formData.get("projectId") as string;
  const name = (formData.get("name") as string)?.trim();
  const quantity = parseFloat((formData.get("quantity") as string) || "0");
  const unit = (formData.get("unit") as string)?.trim();
  const unitPrice = parseFloat((formData.get("unitPrice") as string) || "0");
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!projectId || !name || !unit) return { error: "Project, name and unit required" };

  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId: tenant.id } });
  if (!project) return { error: "Project not found" };

  const totalPrice = quantity * unitPrice;

  await prisma.material.create({
    data: {
      tenantId: tenant.id,
      projectId,
      name,
      quantity,
      unit,
      unitPrice,
      totalPrice,
      notes,
    },
  });
  revalidatePath("/materials");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
