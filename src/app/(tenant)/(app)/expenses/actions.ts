"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

export async function createExpenseAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const projectId = formData.get("projectId") as string;
  const category = (formData.get("category") as string)?.trim();
  const amount = parseFloat((formData.get("amount") as string) || "0");
  const expenseDate = formData.get("expenseDate") as string;
  const description = (formData.get("description") as string)?.trim() || null;

  if (!projectId || !category) return { error: "Project and category required" };

  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId: tenant.id } });
  if (!project) return { error: "Project not found" };

  await prisma.expense.create({
    data: {
      tenantId: tenant.id,
      projectId,
      category,
      amount,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      description,
    },
  });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
