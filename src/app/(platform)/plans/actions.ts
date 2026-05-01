"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const maxProjects = parseInt(formData.get("maxProjects") as string) || 0;
  const maxUsers = parseInt(formData.get("maxUsers") as string) || 0;
  const maxStorageMB = parseInt(formData.get("maxStorageMB") as string) || 0;
  const priceMonthly = formData.get("priceMonthly") as string;
  const priceYearly = formData.get("priceYearly") as string;
  const isActive = formData.get("isActive") === "on";

  if (!name || !slug) throw new Error("Name and slug are required");

  await prisma.plan.create({
    data: {
      name,
      slug: slug.toLowerCase(),
      maxProjects,
      maxUsers,
      maxStorageMB,
      priceMonthly,
      priceYearly,
      isActive,
    },
  });

  revalidatePath("/plans");
}

export async function updatePlan(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const maxProjects = parseInt(formData.get("maxProjects") as string) || 0;
  const maxUsers = parseInt(formData.get("maxUsers") as string) || 0;
  const maxStorageMB = parseInt(formData.get("maxStorageMB") as string) || 0;
  const priceMonthly = formData.get("priceMonthly") as string;
  const priceYearly = formData.get("priceYearly") as string;
  const isActive = formData.get("isActive") === "on";

  await prisma.plan.update({
    where: { id },
    data: {
      name,
      slug: slug.toLowerCase(),
      maxProjects,
      maxUsers,
      maxStorageMB,
      priceMonthly,
      priceYearly,
      isActive,
    },
  });

  revalidatePath("/plans");
}

export async function deletePlan(id: string) {
  // Check if any tenant is using this plan
  const usageCount = await prisma.tenant.count({
    where: { planId: id }
  });

  if (usageCount > 0) {
    throw new Error(`Cannot delete plan that is in use by ${usageCount} tenants.`);
  }

  await prisma.plan.delete({
    where: { id },
  });

  revalidatePath("/plans");
}
