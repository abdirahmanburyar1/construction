"use server";

import { revalidatePath } from "next/cache";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateTenantSettingsAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await getTenantFromSession();
  const tenant = await getTenantForRequest();
  if (!session || session.tenantId !== tenant.id) {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const businessInfo = (formData.get("businessInfo") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const faviconUrl = (formData.get("faviconUrl") as string)?.trim() || null;

  if (!name) return { error: "Company name is required" };

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { name, businessInfo, logoUrl, faviconUrl },
  });

  revalidatePath("/settings");
  revalidatePath("/projects/[id]", "page");
  revalidatePath("/");
  return null;
}
