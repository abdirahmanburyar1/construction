/**
 * Run from project root: npx tsx prisma/debug-login.ts
 * Simulates tenant login and logs what each step returns.
 * Uses .env (Prisma loads it) or set ALBAYAAN_USER_EMAIL / ALBAYAAN_USER_PASSWORD.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUBDOMAIN = "albayaan";
const EMAIL = process.env.ALBAYAAN_USER_EMAIL || "admin@albayaan.dhisme.so";
const PASSWORD = process.env.ALBAYAAN_USER_PASSWORD || "changeme";

async function main() {
  console.log("=== Login debug ===\n");
  console.log("Input:", { subdomain: SUBDOMAIN, email: EMAIL, passwordLength: PASSWORD.length });

  // Step 1: Get tenant by subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: SUBDOMAIN, deletedAt: null },
    select: { id: true, name: true, status: true },
  });
  console.log("\n1. Tenant by subdomain:", tenant ? { id: tenant.id, name: tenant.name, status: tenant.status } : "NOT FOUND");
  if (!tenant) {
    console.log("   -> Login would redirect to /contact (tenant not found)");
    return;
  }

  // Step 2: Find user (exact email)
  const emailLower = EMAIL.trim().toLowerCase();
  let user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email: emailLower,
      isActive: true,
      deletedAt: null,
    },
    select: { id: true, email: true, password: true },
  });
  console.log("\n2. User (exact email):", user ? { id: user.id, email: user.email, hasPassword: !!user.password, passwordLength: user.password?.length } : "NOT FOUND");

  if (!user) {
    const users = await prisma.user.findMany({
      where: { tenantId: tenant.id, isActive: true, deletedAt: null },
      select: { id: true, email: true },
    });
    console.log("   Fallback: all users in tenant:", users.map((u) => u.email));
    user = users.find((u) => u.email.toLowerCase() === emailLower) as typeof user | undefined ?? null;
    if (user) {
      const full = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
      user = full ? { ...user, password: full.password } : null;
    }
  }

  if (!user) {
    console.log("   -> Login would return: Invalid email or password (user not found)");
    return;
  }

  // Step 3: Verify password
  const passwordToTry = PASSWORD.trim();
  let ok = false;
  try {
    ok = await bcrypt.compare(passwordToTry, user.password);
  } catch (e) {
    console.log("\n3. bcrypt.compare threw:", e);
    return;
  }
  console.log("\n3. bcrypt.compare(password, hash):", ok ? "TRUE" : "FALSE");
  console.log("   -> Login would", ok ? "succeed and redirect to /dashboard" : "return: Invalid email or password (wrong password)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
