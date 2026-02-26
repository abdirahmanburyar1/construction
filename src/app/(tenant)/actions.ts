"use server";

import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setTenantSession } from "@/lib/auth";

export async function tenantLoginAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tenant = await getTenantForRequest();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password required" };

  const user = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email, isActive: true, deletedAt: null },
    select: { id: true, password: true },
  });
  if (!user) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, user.password);
  if (!ok) return { error: "Invalid email or password" };

  await setTenantSession(user.id, tenant.id);
  redirect("/dashboard");
}
