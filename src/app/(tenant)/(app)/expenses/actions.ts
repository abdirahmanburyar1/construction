"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

const EXPENSE_CATEGORIES = ["MATERIAL", "LABOR", "EQUIPMENT", "SUBCONTRACT", "OTHER"] as const;

export async function createExpenseAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const projectId = formData.get("projectId") as string;
  const title = (formData.get("title") as string)?.trim() || (formData.get("description") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const amountRaw = (formData.get("amount") as string) || "0";
  const expenseDateRaw = formData.get("expenseDate") as string;

  if (!projectId || !title) return { error: "Project and title required" };
  const categoryVal = EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])
    ? category
    : "OTHER";
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount < 0) return { error: "Valid amount required" };

  const project = await prisma.project.findFirst({ where: { id: projectId, tenantId: tenant.id } });
  if (!project) return { error: "Project not found" };

  await prisma.expense.create({
    data: {
      tenantId: tenant.id,
      projectId,
      title,
      amount,
      category: categoryVal as "MATERIAL" | "LABOR" | "EQUIPMENT" | "SUBCONTRACT" | "OTHER",
      expenseDate: expenseDateRaw ? new Date(expenseDateRaw) : new Date(),
    },
  });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
