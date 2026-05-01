export function computeInvoiceGrandTotal(invoice: {
  items: { amount: unknown }[];
  discount: unknown;
  taxRate: unknown;
  shipping: unknown;
}): number {
  const subtotal = (invoice.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const discount = Number(invoice.discount || 0);
  const taxRate = Number(invoice.taxRate || 0);
  const shipping = Number(invoice.shipping || 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  return subtotal - discount + taxAmount + shipping;
}

