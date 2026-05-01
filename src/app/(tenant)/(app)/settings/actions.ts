"use server";

import { revalidatePath } from "next/cache";
<<<<<<< HEAD
import { getOrganization } from "@/lib/organization-context";
import { getUserFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateOrganizationSettingsAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await getUserFromSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const org = await getOrganization();
=======
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

>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  const name = (formData.get("name") as string)?.trim();
  const businessInfo = (formData.get("businessInfo") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const faviconUrl = (formData.get("faviconUrl") as string)?.trim() || null;

  if (!name) return { error: "Company name is required" };

<<<<<<< HEAD
  await prisma.organization.update({
    where: { id: org.id },
=======
  await prisma.tenant.update({
    where: { id: tenant.id },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    data: { name, businessInfo, logoUrl, faviconUrl },
  });

  revalidatePath("/settings");
  revalidatePath("/projects/[id]", "page");
  revalidatePath("/");
  return null;
}
