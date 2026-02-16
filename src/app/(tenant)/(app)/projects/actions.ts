"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

export async function createProjectAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const estimatedBudget = formData.get("estimatedBudget") as string;
  const status = (formData.get("status") as string) || "Planning";
  if (!name) return { error: "Name required" };

  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      name,
      description,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
      status,
    },
  });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing project" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const estimatedBudget = formData.get("estimatedBudget") as string;
  const status = (formData.get("status") as string) || "Planning";
  if (!name) return { error: "Name required" };

  await prisma.project.updateMany({
    where: { id, tenantId: tenant.id },
    data: {
      name,
      description,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
      status,
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
  return null;
}

export async function deleteProjectAction(tenantId: string, projectId: string): Promise<void> {
  const tenant = await getTenantForRequest();
  if (tenant.id !== tenantId) return;
  await prisma.project.deleteMany({ where: { id: projectId, tenantId: tenant.id } });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
