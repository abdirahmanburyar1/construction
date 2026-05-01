import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const invoices = await p.invoice.findMany({
    include: { items: true, company: true, project: true }
  });
  console.log('INVOICE_COUNT:', invoices.length);
  if (invoices.length > 0) {
    console.log('FIRST_INVOICE_ID:', invoices[0].id);
    console.log('FIRST_INVOICE_DATA:', JSON.stringify(invoices[0], (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
  }
}
main().catch(console.error).finally(() => p.$disconnect());
