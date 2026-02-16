"use server";

import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { verifyPassword, getTenantSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function tenantLoginAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password required" };

  if (tenant.email !== email) return { error: "Invalid email or password" };
  const t = await prisma.tenant.findUnique({ where: { id: tenant.id }, select: { password: true } });
  if (!t) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, t.password);
  if (!ok) return { error: "Invalid email or password" };

  await getTenantSession(tenant.id);
  redirect("/dashboard");
}
