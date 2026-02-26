"use server";

import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setTenantSession } from "@/lib/auth";

export type TenantLoginResult = { error?: string } | { success: true };

export async function tenantLoginAction(
  _prev: unknown,
  formData: FormData
): Promise<TenantLoginResult> {
  const tenant = await getTenantForRequest();
  const emailRaw = (formData.get("email") as string)?.trim() ?? "";
  const email = emailRaw.toLowerCase();
  const password = (formData.get("password") as string)?.trim() ?? "";
  if (!email || !password) return { error: "Email and password required" };

  // Find user: try exact email first, then case-insensitive (works with any DB/driver)
  let user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, password: true },
  });
  if (!user) {
    const users = await prisma.user.findMany({
      where: { tenantId: tenant.id, isActive: true, deletedAt: null },
      select: { id: true, password: true, email: true },
    });
    user = users.find((u) => u.email.toLowerCase() === email) ?? null;
  }
  if (!user) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, user.password);
  if (!ok) return { error: "Invalid email or password" };

  await setTenantSession(user.id, tenant.id);
  return { success: true };
}
