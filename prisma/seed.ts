import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@platform.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin already exists:", adminEmail);
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.create({
    data: { email: adminEmail, password: hash },
  });
  console.log("Admin created:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
