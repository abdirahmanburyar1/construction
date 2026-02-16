import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const TENANT_SESSION_COOKIE = "tenant_session";
const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getTenantSession(tenantId: string): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(TENANT_SESSION_COOKIE)?.value;
  if (existing) return existing;
  const token = `${tenantId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  cookieStore.set(TENANT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return token;
}

export async function getTenantFromSession(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TENANT_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [tenantId] = token.split(":");
  if (!tenantId) return null;
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, email: true },
  });
  return tenant;
}

export async function clearTenantSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TENANT_SESSION_COOKIE);
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
}

export async function setAdminSession(adminId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = `${adminId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getAdminFromSession(): Promise<{ id: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [adminId] = token.split(":");
  if (!adminId) return null;
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true },
  });
  return admin;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
