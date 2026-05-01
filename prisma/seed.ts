import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@platform.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

<<<<<<< HEAD
=======
  // Platform admin (Admin table – legacy)
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
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

<<<<<<< HEAD
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: process.env.ORG_NAME || "My Company",
        hasMultipleCompanies: true,
        maxCompanies: 50,
      },
    });
    console.log("Organization created:", org.name);
  } else {
    console.log("Organization already exists:", org.name);
  }

  const appUserEmail = (process.env.APP_USER_EMAIL || "admin@example.com").trim().toLowerCase();
  const appUserPassword = process.env.APP_USER_PASSWORD || "changeme";

  let appUser = await prisma.user.findUnique({ where: { email: appUserEmail } });
  if (!appUser) {
    appUser = await prisma.user.create({
      data: {
        name: process.env.APP_USER_NAME || "Administrator",
        email: appUserEmail,
        password: await bcrypt.hash(appUserPassword.trim(), 12),
        role: "COMPANY_ADMIN",
      },
    });
    console.log("App user created:", appUserEmail);
  } else {
    console.log("App user already exists:", appUserEmail);
=======
  // Platform user (User with tenantId null – not under any tenant)
  const platformUserHash = await bcrypt.hash(adminPassword.trim(), 12);
  let platformUser = await prisma.user.findFirst({
    where: { email: adminEmail, tenantId: null },
  });
  if (!platformUser) {
    platformUser = await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        password: platformUserHash,
        role: "SUPER_ADMIN",
        tenantId: null,
      },
    });
    console.log("Platform user created (tenantId=null):", adminEmail);
  } else {
    console.log("Platform user already exists (tenantId=null):", adminEmail);
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

  // Features
  const features = [
    { key: "PROJECTS_MODULE", name: "Projects Management", description: "Manage construction projects, phases, and cost items" },
    { key: "PROCUREMENT_MODULE", name: "Procurement & Materials", description: "Manage suppliers, materials, and purchase orders" },
    { key: "ASSETS_MODULE", name: "Assets Management", description: "Track company fixed and current assets" },
    { key: "REPORTS_MODULE", name: "Advanced Reporting", description: "Financial reports, balance sheets, and profit/loss" },
    { key: "LABOR_MODULE", name: "Labor & Payroll", description: "Manage workers, attendance, and payroll" },
    { key: "EQUIPMENT_MODULE", name: "Equipment Tracking", description: "Track machinery and maintenance logs" },
  ];

  for (const f of features) {
    const feature = await prisma.feature.upsert({
      where: { key: f.key },
      update: { name: f.name, description: f.description },
      create: f,
    });

    // Link all features to Basic plan by default for now
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: plan.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: plan.id,
        featureId: feature.id,
        enabled: true,
      },
    });
  }
  console.log("Features and plan associations seeded.");

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
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
