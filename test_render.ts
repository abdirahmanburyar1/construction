import { prisma } from './src/lib/prisma';
import { format } from 'date-fns';

async function simulateRender(id: string) {
<<<<<<< HEAD
  const invoice = await prisma.invoice.findFirst({
    where: { id, deletedAt: null },
=======
  const tenantId = 'cmmpe1gwh000nzom6srbh3x14'; // From diagnostic
  const invoice = await prisma.invoice.findUnique({
    where: { id, tenantId, deletedAt: null },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    include: { project: true, company: true, items: true }
  });

  if (!invoice) {
    console.log('NOT_FOUND');
    return;
  }

  try {
    const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const discount = Number(invoice.discount || 0);
    const taxRate = Number(invoice.taxRate || 0);
    const shipping = Number(invoice.shipping || 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount + shipping;

    console.log('RENDER_SUCCESS');
    console.log('SUBTOTAL:', subtotal);
    console.log('TOTAL:', total);
    console.log('DATES:', format(invoice.issueDate, 'MMMM d, yyyy'), format(invoice.dueDate, 'MMMM d, yyyy'));
  } catch (e) {
    console.error('RENDER_ERROR:', e);
  }
}

simulateRender('cmmpf30ki000gclrvy0lhgwkc').finally(() => prisma.$disconnect());
