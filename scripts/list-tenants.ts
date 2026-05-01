<<<<<<< HEAD
/**
 * Lists the single Organization row (replaces former multi-tenant list).
 * Run: npx tsx scripts/list-tenants.ts
 */
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const orgs = await p.organization.findMany();
  console.log("Organizations:", orgs.length);
  console.log(JSON.stringify(orgs, null, 2));
}

main()
=======
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const tenants = await p.tenant.findMany({
    where: { deletedAt: null },
    select: { name: true, subdomain: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  console.log("Tenants in database:", tenants.length);
  console.log(JSON.stringify(tenants, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  .finally(() => p.$disconnect());
