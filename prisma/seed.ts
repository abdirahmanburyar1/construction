import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@platform.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  const demoUserEmail = process.env.DEMO_USER_EMAIL || "demo@example.com";
  const demoUserPassword = process.env.DEMO_USER_PASSWORD || "changeme";

  // Platform admin
  let admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
      },
    });
    console.log("Admin created:", adminEmail);
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  // Default plan
  let plan = await prisma.plan.findUnique({ where: { slug: "basic" } });
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: "Basic",
        slug: "basic",
        maxProjects: 10,
        maxUsers: 5,
        maxStorageMB: 1024,
        priceMonthly: 49.99,
        priceYearly: 499.99,
      },
    });
    console.log("Plan created: Basic");
  }

  // Default tenant: albayaan (albayaan.dhisme.so)
  const albayaanSubdomain = "albayaan";
  const albayaanEmail = process.env.ALBAYAAN_USER_EMAIL || "admin@albayaan.dhisme.so";
  const albayaanPassword = process.env.ALBAYAAN_USER_PASSWORD || "changeme";

  let albayaan = await prisma.tenant.findUnique({ where: { subdomain: albayaanSubdomain } });
  if (!albayaan) {
    albayaan = await prisma.tenant.create({
      data: {
        name: "Albayaan",
        subdomain: albayaanSubdomain,
        status: "ACTIVE",
        planId: plan.id,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    const albayaanUserHash = await bcrypt.hash(albayaanPassword.trim(), 12);
    await prisma.user.create({
      data: {
        name: "Albayaan Admin",
        email: albayaanEmail.trim().toLowerCase(),
        password: albayaanUserHash,
        role: "COMPANY_ADMIN",
        tenantId: albayaan.id,
      },
    });
    console.log("Albayaan tenant created: https://albayaan.dhisme.so —", albayaanEmail);
  } else {
    const hasUser = await prisma.user.findFirst({
      where: { tenantId: albayaan.id, role: "COMPANY_ADMIN" },
    });
    if (!hasUser) {
      const albayaanUserHash = await bcrypt.hash(albayaanPassword.trim(), 12);
      await prisma.user.create({
        data: {
          name: "Albayaan Admin",
          email: albayaanEmail.trim().toLowerCase(),
          password: albayaanUserHash,
          role: "COMPANY_ADMIN",
          tenantId: albayaan.id,
        },
      });
      console.log("Albayaan admin user created:", albayaanEmail);
    } else {
      console.log("Albayaan tenant already exists: albayaan.dhisme.so");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
