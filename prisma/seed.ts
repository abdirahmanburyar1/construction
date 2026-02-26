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

  // Demo tenant + first user (company admin)
  const subdomain = "demo";
  let tenant = await prisma.tenant.findUnique({ where: { subdomain } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Demo Company",
        subdomain,
        status: "TRIAL",
        planId: plan.id,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    const userHash = await bcrypt.hash(demoUserPassword, 12);
    await prisma.user.create({
      data: {
        name: "Demo Admin",
        email: demoUserEmail,
        password: userHash,
        role: "COMPANY_ADMIN",
        tenantId: tenant.id,
      },
    });
    console.log("Demo tenant and user created:", subdomain, demoUserEmail);
  } else {
    console.log("Demo tenant already exists:", subdomain);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
