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

export async function setTenantSession(userId: string, tenantId: string): Promise<string> {
  const cookieStore = await cookies();
  const token = `${userId}:${tenantId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const isProduction = process.env.NODE_ENV === "production";
  const platformDomain = process.env.PLATFORM_DOMAIN || "localhost:3000";
  const domain = isProduction && platformDomain.includes(".") ? `.${platformDomain.split(":")[0]}` : undefined;
  cookieStore.set(TENANT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    ...(domain && { domain }),
  });
  return token;
}

export type TenantSession = {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
};

export async function getTenantFromSession(): Promise<TenantSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TENANT_SESSION_COOKIE)?.value;
  if (!token) return null;
  const [userId, tenantId] = token.split(":");
  if (!userId || !tenantId) return null;
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, isActive: true, deletedAt: null },
    select: { id: true, email: true, role: true, tenantId: true },
  });
  if (!user) return null;
  return {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
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
