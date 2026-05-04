import { prisma } from "@/lib/prisma";
import { getOrganization } from "@/lib/organization-context";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { computeQuotationTotal } from "../quotation-math";
import { deleteQuotation, convertQuotationToInvoice } from "../actions";
import { PrintButton } from "./print-button";

function getStatusColor(status: string) {
  switch (status) {
    case "ACCEPTED": return "bg-green-100 text-green-700 border-green-200";
    case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
    case "SENT": return "bg-blue-100 text-blue-700 border-blue-200";
    case "EXPIRED": return "bg-orange-100 text-orange-700 border-orange-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

async function handleConvert(quotationId: string) {
  "use server";
  const result = await convertQuotationToInvoice(quotationId);
  if (result.invoiceId) {
    redirect(`/invoices/${result.invoiceId}`);
  }
}

async function handleDelete(quotationId: string) {
  "use server";
  await deleteQuotation(quotationId);
  redirect("/quotations");
}

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const org = await getOrganization();

  const quotation = await prisma.quotation.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      project: { include: { client: true } },
      company: true,
      items: true,
    },
  });

  if (!quotation) notFound();

  const subtotal = quotation.items.reduce((s, i) => s + Number(i.amount), 0);
  const discount = Number(quotation.discount || 0);
  const total = computeQuotationTotal(quotation);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const isExpired = new Date(quotation.validUntil) < new Date() && quotation.status !== "ACCEPTED";
  const canConvert = !quotation.convertedToInvoiceId && quotation.status !== "REJECTED";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-8 print:hidden">
        <div>
          <Link href="/quotations" className="group inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
            Back to Quotations
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
              {quotation.quotationNumber || "QUO-TEMP"}
            </h1>
            <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.2em] ${getStatusColor(quotation.status)}`}>
              {quotation.status}
            </span>
            {isExpired && quotation.status === "SENT" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.2em] bg-orange-100 text-orange-700 border-orange-200">
                Expired
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {quotation.convertedToInvoiceId && (
            <Link
              href={`/invoices/${quotation.convertedToInvoiceId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              View Invoice →
            </Link>
          )}
          {canConvert && (
            <form action={handleConvert.bind(null, quotation.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Convert to Invoice
              </button>
            </form>
          )}
          <Link
            href={`/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <PrintButton />
          <form action={handleDelete.bind(null, quotation.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Quotation Document */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-0 print:shadow-none print:rounded-none mx-auto max-w-5xl">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body:not(.print-single-receipt) * { visibility: hidden; }
              body:not(.print-single-receipt) .print-area,
              body:not(.print-single-receipt) .print-area * { visibility: visible; }
              .print-area { position: absolute; left: 0; top: 0; width: 100%; }
              @page { margin: 1.5cm; }
            }
          `
        }} />

        <div className="print-area p-10 sm:p-14">
          <div className="mx-auto max-w-[820px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-10">
              <div className="min-w-[180px]">
                {quotation.company?.logoUrl ? (
                  <img src={quotation.company.logoUrl} alt="Logo" className="h-14 w-auto max-w-[200px] object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-14 w-[200px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-semibold tracking-widest text-slate-600 uppercase">
                    Your Logo
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Quotation no.</div>
                <div className="text-sm font-semibold text-slate-900 tracking-wider">{quotation.quotationNumber || "—"}</div>
                <div className="mt-2 text-[11px] text-slate-500">
                  <span className="font-semibold">Date:</span> {format(quotation.issueDate, "dd MMMM, yyyy")}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold">Valid until:</span> {format(quotation.validUntil, "dd MMMM, yyyy")}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mt-10">
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 font-display uppercase leading-none">
                Quotation
              </div>
            </div>

            {/* Parties */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">Prepared for</div>
                <div className="text-sm text-slate-900 font-semibold">
                  {quotation.recipientName || quotation.project?.client?.name || "Client"}
                </div>
                <div className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {quotation.recipientAddress || (quotation.project?.client as any)?.address || ""}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">Prepared by</div>
                <div className="text-sm text-slate-900 font-semibold">{quotation.company?.name || org.name}</div>
                <div className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {quotation.company?.address || ""}
                </div>
                {quotation.company?.email && <div className="mt-1 text-sm text-slate-700">{quotation.company.email}</div>}
              </div>
            </div>

            {/* Items */}
            <div className="mt-10">
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-100 px-6 py-4">
                  <div className="grid grid-cols-12 text-[12px] font-semibold text-slate-700">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>
                <div className="divide-y divide-slate-200">
                  {quotation.items.map((item, idx) => (
                    <div key={item.id} className={`px-6 py-4 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <div className="grid grid-cols-12 text-sm text-slate-800">
                        <div className="col-span-6">{item.description}</div>
                        <div className="col-span-2 text-center">{Number(item.quantity).toLocaleString()}</div>
                        <div className="col-span-2 text-right">${formatCurrency(Number(item.unitPrice))}</div>
                        <div className="col-span-2 text-right font-semibold">${formatCurrency(Number(item.amount))}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="bg-white px-6 py-4 space-y-2">
                  <div className="grid grid-cols-12 text-sm text-slate-500">
                    <div className="col-span-10 text-right">Subtotal</div>
                    <div className="col-span-2 text-right">${formatCurrency(subtotal)}</div>
                  </div>
                  {discount > 0 && (
                    <div className="grid grid-cols-12 text-sm text-red-500">
                      <div className="col-span-10 text-right">Discount</div>
                      <div className="col-span-2 text-right">-${formatCurrency(discount)}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-12 text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                    <div className="col-span-10 text-right">Total</div>
                    <div className="col-span-2 text-right">${formatCurrency(total)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {quotation.notes && (
              <div className="mt-10">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">Notes</div>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{quotation.notes}</div>
              </div>
            )}
            {(quotation.terms || quotation.company?.notes) && (
              <div className="mt-6">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase mb-2">Terms & Conditions</div>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {quotation.terms || quotation.company?.notes}
                </div>
              </div>
            )}

            <div className="mt-10 text-center text-[11px] text-slate-500">
              This quotation is valid until {format(quotation.validUntil, "dd MMMM, yyyy")}.
            </div>
          </div>
        </div>
      </div>

      {/* Screen-only summary */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 gap-12">
        <div className="space-y-4">
          {quotation.project && (
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Project Reference</p>
              <h3 className="text-base font-black text-teal-600 uppercase tracking-tight">{quotation.project.name}</h3>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-slate-500 px-2">
            <span>Subtotal</span><span>${formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-500 px-2">
              <span>Discount</span><span>-${formatCurrency(discount)}</span>
            </div>
          )}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end px-2">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Amount</p>
              <div className="text-4xl font-black text-slate-900 font-display">${formatCurrency(total)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
