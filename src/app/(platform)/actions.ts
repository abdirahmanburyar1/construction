"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setAdminSession } from "@/lib/auth";

export async function adminLoginAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password required" };

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return { error: "Invalid email or password" };
  const ok = await verifyPassword(password, admin.password);
  if (!ok) return { error: "Invalid email or password" };

  await setAdminSession(admin.id);
  redirect("/");
}
