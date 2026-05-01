import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function run() {
  try {
<<<<<<< HEAD
    const orgs = await p.organization.findMany();
    console.log("ORGANIZATIONS_START");
    console.log(JSON.stringify(orgs, null, 2));
    console.log("ORGANIZATIONS_END");
    const users = await p.user.findMany({ select: { id: true, email: true, role: true } });
    console.log("USERS_START");
    console.log(JSON.stringify(users, null, 2));
    console.log("USERS_END");
=======
    const plans = await p.plan.findMany();
    console.log("PLANS_START");
    console.log(JSON.stringify(plans, null, 2));
    console.log("PLANS_END");
    const tenants = await p.tenant.findMany({ include: { plan: true } });
    console.log("TENANTS_START");
    console.log(JSON.stringify(tenants, null, 2));
    console.log("TENANTS_END");
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
run();
