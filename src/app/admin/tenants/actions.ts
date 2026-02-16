"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function createTenantAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const admin = await getAdminFromSession();
  if (!admin) return { error: "Unauthorized" };

  const companyName = (formData.get("companyName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const subscriptionStatus = (formData.get("subscriptionStatus") as string) || "ACTIVE";
  const startRaw = formData.get("subscriptionStartDate") as string;
  const expiryRaw = formData.get("subscriptionExpiryDate") as string;

  if (!companyName || !slug || !email || !password) return { error: "Required fields missing" };

  const existing = await prisma.tenant.findFirst({ where: { OR: [{ slug }, { email }] } });
  if (existing) return { error: "Slug or email already in use" };

  await prisma.tenant.create({
    data: {
      companyName,
      slug,
      email,
      password: await hashPassword(password),
      subscriptionStatus,
      subscriptionStartDate: startRaw ? new Date(startRaw) : null,
      subscriptionExpiryDate: expiryRaw ? new Date(expiryRaw) : null,
    },
  });
  revalidatePath("/admin/tenants");
  revalidatePath("/admin");
  redirect("/admin/tenants");
}

export async function updateTenantAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const admin = await getAdminFromSession();
  if (!admin) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing tenant" };

  const companyName = (formData.get("companyName") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const email = (formData.get("email") as string)?.trim();
  const subscriptionStatus = (formData.get("subscriptionStatus") as string) || "ACTIVE";
  const startRaw = formData.get("subscriptionStartDate") as string;
  const expiryRaw = formData.get("subscriptionExpiryDate") as string;
  const newPassword = formData.get("password") as string;

  if (!companyName || !slug || !email) return { error: "Required fields missing" };

  const existing = await prisma.tenant.findFirst({
    where: { id: { not: id }, OR: [{ slug }, { email }] },
  });
  if (existing) return { error: "Slug or email already in use" };

  const data: Parameters<typeof prisma.tenant.update>[0]["data"] = {
    companyName,
    slug,
    email,
    subscriptionStatus,
    subscriptionStartDate: startRaw ? new Date(startRaw) : null,
    subscriptionExpiryDate: expiryRaw ? new Date(expiryRaw) : null,
  };
  if (newPassword && newPassword.length >= 6) {
    data.password = await hashPassword(newPassword);
  }

  await prisma.tenant.update({ where: { id }, data });
  revalidatePath("/admin/tenants");
  revalidatePath("/admin");
  redirect("/admin/tenants");
}
