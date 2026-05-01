import { prisma } from "@/lib/prisma";
import { getOrganization } from "@/lib/organization-context";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { computeInvoiceGrandTotal } from "../invoice-math";
import { PrintButton } from "./print-button";
import { InvoicePaymentsSection } from "./invoice-payments-section";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const org = await getOrganization();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
      deletedAt: null,
    },
    include: {
      project: {
        include: {
          client: true,
        }
      },
      company: true,
      items: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const subtotal = (invoice.items || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const discount = Number(invoice.discount || 0);
  const taxRate = Number(invoice.taxRate || 0);
  const shipping = Number(invoice.shipping || 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = computeInvoiceGrandTotal(invoice);
  const paidTotal = (invoice.payments || []).reduce((s: number, p: { amount: unknown }) => s + Number(p.amount), 0);
  const remaining = Math.max(0, total - paidTotal);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-700 border-green-200";
      case "OVERDUE": return "bg-red-100 text-red-700 border-red-200";
      case "SENT": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PARTIAL": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const formatInvoiceNo = (invoiceNumber: string | null) => {
    const raw = (invoiceNumber ?? "").trim();
    const m = raw.match(/(\d+)/);
    const n = m ? Number(m[1]) : NaN;
    if (!Number.isFinite(n)) return raw || "000001";
    return n.toString().padStart(6, "0");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Action Bar - Hidden on Print */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-8 print:hidden">
        <div>
          <Link
            href="/invoices"
            className="group inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
            Back to Invoices
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">{invoice.invoiceNumber || 'INV-TEMP'}</h1>
            <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.2em] ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PrintButton />
        </div>
      </div>

      <InvoicePaymentsSection
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        invoiceStatus={invoice.status}
        recipientName={invoice.recipientName}
        grandTotal={total}
        paidTotal={paidTotal}
        remaining={remaining}
        payments={invoice.payments}
        tenantName={org.name}
        tenantLogoUrl={org.logoUrl ?? null}
        tenantBusinessInfo={org.businessInfo ?? null}
      />

      {/* Invoice Document Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-0 print:shadow-none print:rounded-none mx-auto max-w-5xl">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            @page { margin: 1.5cm; }
          }
        `}} />

        <div  className="print-area p-10 sm:p-14">
          <div className="mx-auto max-w-[820px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-10">
              <div className="min-w-[180px]">
                {invoice.company?.logoUrl ? (
                  <img
                    src={invoice.company.logoUrl}
                    alt={`${invoice.company?.name ?? org.name} logo`}
                    className="h-14 w-auto max-w-[200px] object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-[200px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-semibold tracking-widest text-slate-600 uppercase">
                    Your Logo
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Invoice no.
                </div>
                <div className="text-sm font-semibold text-slate-900 tracking-wider">
                  {formatInvoiceNo(invoice.invoiceNumber)}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mt-10">
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 font-display uppercase leading-none">
                Invoice
              </div>
              <div className="mt-5 text-sm text-slate-700">
                <span className="font-semibold">Date:</span>{" "}
                <span className="font-medium">{format(invoice.issueDate, "dd MMMM, yyyy")}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">
                  Billed to
                </div>
                <div className="text-sm text-slate-900 font-semibold">
                  {invoice.recipientName || invoice.project?.client?.name || "Customer"}
                </div>
                <div className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {invoice.recipientAddress || invoice.project?.client?.address || ""}
                </div>
                {(invoice.project?.client as any)?.email && (
                  <div className="mt-1 text-sm text-slate-700">{(invoice.project?.client as any).email}</div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">
                  From
                </div>
                <div className="text-sm text-slate-900 font-semibold">{invoice.company?.name || org.name}</div>
                <div className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {invoice.company?.address || ""}
                </div>
                {invoice.company?.email && <div className="mt-1 text-sm text-slate-700">{invoice.company.email}</div>}
              </div>
            </div>

            {/* Items */}
            <div className="mt-10">
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-100 px-6 py-4">
                  <div className="grid grid-cols-12 text-[12px] font-semibold text-slate-700">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {invoice.items.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className={`px-6 py-4 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                    >
                      <div className="grid grid-cols-12 text-sm text-slate-800">
                        <div className="col-span-6">{item.description}</div>
                        <div className="col-span-2 text-center">{Number(item.quantity || 0).toLocaleString()}</div>
                        <div className="col-span-2 text-right">${formatCurrency(Number(item.unitPrice || 0))}</div>
                        <div className="col-span-2 text-right font-semibold">${formatCurrency(Number(item.amount || 0))}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total row */}
                <div className="bg-white px-6 py-4">
                  <div className="grid grid-cols-12 text-sm font-semibold text-slate-900">
                    <div className="col-span-10 text-right">Total</div>
                    <div className="col-span-2 text-right">${formatCurrency(total)}</div>
                  </div>
                  {paidTotal > 0 && (
                    <>
                      <div className="mt-3 grid grid-cols-12 text-sm text-slate-700">
                        <div className="col-span-10 text-right">Paid to date</div>
                        <div className="col-span-2 text-right">${formatCurrency(paidTotal)}</div>
                      </div>
                      <div className="mt-1 grid grid-cols-12 text-sm font-semibold text-slate-900">
                        <div className="col-span-10 text-right">Balance due</div>
                        <div className="col-span-2 text-right">${formatCurrency(remaining)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 text-center text-[11px] text-slate-500">
              Thank you for your business.
            </div>
            </div>
            </div>

            <div className="text-right space-y-2 self-stretch sm:self-start">
              <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-[0.3em] mb-4">
                Invoice
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Invoice Number</p>
                <p className="text-xl font-black text-slate-900">{invoice.invoiceNumber || 'INV-TEMP'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Invoice Date</p>
                <p className="text-sm font-bold text-slate-700">{format(invoice.issueDate, 'MMMM d, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Due Date</p>
                <p className="text-sm font-bold text-slate-700">{format(invoice.dueDate, 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Recipient info & Project - Grouped on the same side as one "Billed To" unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Billed To</p>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{invoice.recipientName || (invoice.project?.client?.name || 'Customer')}</h3>
                  <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed max-w-sm">
                    {invoice.recipientAddress || (invoice.project?.client?.address || 'Address Not Provided')}
                  </p>
                </div>
              </div>

              {invoice.project && (
                <div className="pt-6 border-t border-slate-100 max-w-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Project Reference</p>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-teal-600 uppercase tracking-tight leading-tight">{invoice.project.name}</h3>
                    {invoice.project.location && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        {invoice.project.location}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Table - Now Bordered */}
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm border-collapse border border-slate-200 rounded-xl">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest border-r border-slate-200">Description</th>
                  <th className="px-4 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest w-24 text-center border-r border-slate-200">Qty</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest w-32 text-right border-r border-slate-200">Rate</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right w-40">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item: any) => (
                  <tr key={item.id} className="group transition-colors">
                    <td className="px-6 py-5 border-r border-slate-200">
                      <p className="text-slate-900 font-bold text-base">{item.description}</p>
                    </td>
                    <td className="px-4 py-5 text-slate-600 font-medium text-center border-r border-slate-200">{Number(item.quantity || 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium text-right border-r border-slate-200">{formatCurrency(Number(item.unitPrice || 0))}</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900 text-lg">{formatCurrency(Number(item.amount || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-between gap-12 pt-4">
            <div className="flex-1 space-y-6">
              {(invoice.terms || invoice.company?.notes) && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Terms & Conditions</p>
                  <div className="text-xs text-slate-500 font-medium leading-loose bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                    {invoice.terms || invoice.company?.notes}
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Notes</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-slate-500 px-2">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-red-500 px-2">
                  <span>Discount</span>
                  <span>-${formatCurrency(discount)}</span>
                </div>
              )}

              {taxRate > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-slate-500 px-2">
                  <span>Tax ({taxRate}%)</span>
                  <span>${formatCurrency(taxAmount)}</span>
                </div>
              )}

              {shipping > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-slate-500 px-2">
                  <span>Shipping</span>
                  <span>${formatCurrency(shipping)}</span>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 mt-4 flex justify-between items-end px-2">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Amount</p>
                  <div className="text-4xl font-black text-slate-900 font-display transition-all">
                    ${formatCurrency(total)}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] text-center border-t border-slate-50 print:block hidden">
                Thank you for your business
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
