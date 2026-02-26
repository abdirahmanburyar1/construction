"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

export async function createProjectAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const budgetRaw = formData.get("budget") as string;
  const status = (formData.get("status") as string) || "PLANNING";
  const startDateRaw = formData.get("startDate") as string;
  const endDateRaw = formData.get("endDate") as string;
  const clientId = (formData.get("clientId") as string)?.trim() || null;

  if (!name) return { error: "Name required" };
  const budget = budgetRaw ? parseFloat(budgetRaw) : 0;
  if (Number.isNaN(budget) || budget < 0) return { error: "Valid budget required" };
  if (!startDateRaw) return { error: "Start date required" };

  const startDate = new Date(startDateRaw);
  const endDate = endDateRaw ? new Date(endDateRaw) : null;
  const validStatus = PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number]) ? status : "PLANNING";

  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      name,
      description,
      location,
      budget,
      status: validStatus as "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED",
      startDate,
      endDate,
      clientId,
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
  const location = (formData.get("location") as string)?.trim() || null;
  const budgetRaw = formData.get("budget") as string;
  const status = (formData.get("status") as string) || "PLANNING";
  const startDateRaw = formData.get("startDate") as string;
  const endDateRaw = formData.get("endDate") as string;
  const clientId = (formData.get("clientId") as string)?.trim() || null;

  if (!name) return { error: "Name required" };
  const budget = budgetRaw ? parseFloat(budgetRaw) : 0;
  if (Number.isNaN(budget) || budget < 0) return { error: "Valid budget required" };
  if (!startDateRaw) return { error: "Start date required" };

  const startDate = new Date(startDateRaw);
  const endDate = endDateRaw ? new Date(endDateRaw) : null;
  const validStatus = PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number]) ? status : "PLANNING";

  await prisma.project.updateMany({
    where: { id, tenantId: tenant.id },
    data: {
      name,
      description,
      location,
      budget,
      status: validStatus as "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED",
      startDate,
      endDate,
      clientId,
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
