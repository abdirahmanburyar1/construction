"use server";

<<<<<<< HEAD
import { getOrganization } from "@/lib/organization-context";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setAppSession, clearAppSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AppLoginResult = { error?: string } | { success: true };

export async function appLogoutAction() {
  await clearAppSession();
=======
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setTenantSession, clearTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export type TenantLoginResult = { error?: string } | { success: true };

export async function tenantLogoutAction() {
  await clearTenantSession();
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  redirect("/login");
}

export async function tenantLoginAction(
  _prev: unknown,
  formData: FormData
<<<<<<< HEAD
): Promise<AppLoginResult> {
  await getOrganization();
=======
): Promise<TenantLoginResult> {
  const tenant = await getTenantForRequest();
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  const emailRaw = (formData.get("email") as string)?.trim() ?? "";
  const email = emailRaw.toLowerCase();
  const password = (formData.get("password") as string)?.trim() ?? "";
  if (!email || !password) return { error: "Email and password required" };

<<<<<<< HEAD
  let user = await prisma.user.findFirst({
    where: {
=======
  // Find user: try exact email first, then case-insensitive (works with any DB/driver)
  let user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      email,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, password: true },
  });
  if (!user) {
    const users = await prisma.user.findMany({
<<<<<<< HEAD
      where: { isActive: true, deletedAt: null },
=======
      where: { tenantId: tenant.id, isActive: true, deletedAt: null },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      select: { id: true, password: true, email: true },
    });
    user = users.find((u) => u.email.toLowerCase() === email) ?? null;
  }
  if (!user) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, user.password);
  if (!ok) return { error: "Invalid email or password" };

<<<<<<< HEAD
  await setAppSession(user.id);
=======
  await setTenantSession(user.id, tenant.id);
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  return { success: true };
}
