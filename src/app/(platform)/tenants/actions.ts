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

  const name = (formData.get("companyName") as string)?.trim();
  const subdomain = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const adminEmail = (formData.get("email") as string)?.trim().toLowerCase();
  const adminPassword = formData.get("password") as string;
  const status = (formData.get("subscriptionStatus") as string) || "ACTIVE";
  const expiryRaw = formData.get("subscriptionExpiryDate") as string;

  if (!name || !subdomain || !adminEmail || !adminPassword) return { error: "Required fields missing" };

  const existing = await prisma.tenant.findUnique({ where: { subdomain } });
  if (existing) return { error: "Subdomain already in use" };

  const plan = await prisma.plan.findFirst({ where: { isActive: true } });
  const subscriptionExpiryAt = expiryRaw ? new Date(expiryRaw) : null;

  const tenant = await prisma.tenant.create({
    data: {
      name,
      subdomain,
      status: status as "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED",
      planId: plan?.id ?? undefined,
      subscriptionExpiryAt,
    },
  });
  if (!tenant) return { error: "Failed to create tenant" };

  await prisma.user.create({
    data: {
      name: name + " Admin",
      email: adminEmail,
      password: await hashPassword(adminPassword),
      role: "COMPANY_ADMIN",
      tenantId: tenant.id,
    },
  });

  revalidatePath("/tenants");
  revalidatePath("/");
  redirect("/tenants");
}

export async function updateTenantAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const admin = await getAdminFromSession();
  if (!admin) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing tenant" };

  const name = (formData.get("companyName") as string)?.trim();
  const subdomain = (formData.get("slug") as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const adminEmail = (formData.get("email") as string)?.trim().toLowerCase();
  const status = (formData.get("subscriptionStatus") as string) || "ACTIVE";
  const expiryRaw = formData.get("subscriptionExpiryDate") as string;
  const newPassword = formData.get("password") as string;

  if (!name || !subdomain || !adminEmail) return { error: "Required fields missing" };

  const existingTenant = await prisma.tenant.findFirst({
    where: { id: { not: id }, subdomain },
  });
  if (existingTenant) return { error: "Subdomain already in use" };

  const subscriptionExpiryAt = expiryRaw ? new Date(expiryRaw) : null;

  await prisma.tenant.update({
    where: { id },
    data: {
      name,
      subdomain,
      status: status as "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED",
      subscriptionExpiryAt,
    },
  });

  const firstUser = await prisma.user.findFirst({
    where: { tenantId: id, role: "COMPANY_ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (firstUser) {
    const userData: { email: string; name?: string; password?: string } = {
      email: adminEmail.toLowerCase(),
      name: name + " Admin",
    };
    if (newPassword && newPassword.length >= 6) {
      userData.password = await hashPassword(newPassword);
    }
    await prisma.user.update({
      where: { id: firstUser.id },
      data: userData,
    });
  }

  revalidatePath("/tenants");
  revalidatePath("/");
  redirect("/tenants");
}
