"use client";

import { useRef } from "react";
import { format } from "date-fns";

type ReceiptRow = {
  id: string;
  receiptNumber: string | null;
  amount: number;
  paidAt: Date;
  paymentMethod: string | null;
  reference: string | null;
  accountNo: string | null;
  notes: string | null;
  invoiceNumber: string | null;
  recipientName: string | null;
};

function ReceiptSlip({
  receipt,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
  copyLabel,
}: {
  receipt: ReceiptRow;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
  copyLabel?: string;
}) {
  const amountFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(receipt.amount);
  const paidDate = format(new Date(receipt.paidAt), "MMMM d, yyyy");

  return (
    <div className="receipt-slip bg-[#faf8f5] p-6 min-h-[380px] flex flex-col">
      {copyLabel && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">{copyLabel}</p>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-shrink-0">
          {tenantLogoUrl ? (
            <img src={tenantLogoUrl} alt="Logo" className="h-14 w-14 object-contain object-left" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded border border-slate-300 bg-white">
              <span className="text-xs font-medium text-slate-400">Logo</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <h2 className="inline-block rounded-lg border-2 border-teal-600 px-4 py-2 text-center text-lg font-bold text-teal-700">
            MONEY RECEIPT
          </h2>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-semibold text-teal-700">{tenantName}</p>
          {tenantBusinessInfo && (
            <p className="mt-1 max-w-[200px] text-xs leading-snug text-slate-600">{tenantBusinessInfo}</p>
          )}
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Date:</span> {paidDate}
          </p>
        </div>
      </div>
      <div className="mt-6 flex-1 space-y-3 text-sm">
        <div className="flex gap-x-4">
          <span className="text-slate-600">Receipt No:</span>
          <span className="font-semibold text-slate-900">{receipt.receiptNumber ?? "—"}</span>
        </div>
        <div className="flex gap-x-2">
          <span className="text-slate-600">Received with thanks from:</span>
          <span className="border-b border-slate-400 border-dotted font-medium text-slate-900">
            {receipt.recipientName ?? "—"}
          </span>
        </div>
        <div className="flex gap-x-2">
          <span className="text-slate-600">Payment method:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{receipt.paymentMethod ?? "—"}</span>
          <span className="ml-2 text-slate-600">Account No:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{receipt.accountNo ?? "—"}</span>
        </div>
        <div className="flex gap-x-2">
          <span className="text-slate-600">Reference:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{receipt.reference ?? "—"}</span>
        </div>
        <div className="flex gap-x-2">
          <span className="text-slate-600">For invoice:</span>
          <span className="border-b border-slate-400 border-dotted font-medium text-slate-900">
            {receipt.invoiceNumber ?? "—"}
            {receipt.notes ? ` — ${receipt.notes}` : ""}
          </span>
        </div>
        <div className="flex items-baseline gap-x-4">
          <span className="text-slate-600">Amount:</span>
          <span className="inline-block border-2 border-slate-700 bg-white px-3 py-1.5 font-bold text-slate-900">
            {amountFormatted}
          </span>
        </div>
      </div>
      <div className="-mx-6 -mb-6 mt-auto h-4 bg-gradient-to-r from-teal-700 to-teal-500" aria-hidden />
    </div>
  );
}

function PrintableReceipt({
  receipt,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  receipt: ReceiptRow;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const body = document.body;
    const originalClass = body.className;
    body.classList.add("print-single-receipt");
    el.classList.add("print-this-receipt");
    window.print();
    body.className = originalClass;
    el.classList.remove("print-this-receipt");
  };

  const amountFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(receipt.amount);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 bg-[#faf8f5]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Receipt No.</p>
            <p className="text-lg font-black text-slate-900 font-mono">{receipt.receiptNumber || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</p>
            <p className="text-lg font-black text-teal-700">{amountFormatted}</p>
          </div>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <p><span className="font-semibold text-slate-800">From:</span> {receipt.recipientName || "—"}</p>
          <p><span className="font-semibold text-slate-800">Invoice:</span> {receipt.invoiceNumber || "—"}</p>
          <p><span className="font-semibold text-slate-800">Method:</span> {receipt.paymentMethod || "—"}</p>
          <p><span className="font-semibold text-slate-800">Date:</span> {format(new Date(receipt.paidAt), "MMM d, yyyy")}</p>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 flex justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" />
          </svg>
          Print receipt
        </button>
      </div>

      {/* Hidden print copy */}
      <div ref={printRef} className="hidden print:!block receipt-two-copies" aria-hidden>
        <div className="receipt-copy">
          <ReceiptSlip receipt={receipt} tenantName={tenantName} tenantLogoUrl={tenantLogoUrl} tenantBusinessInfo={tenantBusinessInfo} copyLabel="Customer copy" />
        </div>
        <div className="receipt-copy">
          <ReceiptSlip receipt={receipt} tenantName={tenantName} tenantLogoUrl={tenantLogoUrl} tenantBusinessInfo={tenantBusinessInfo} copyLabel="Office copy" />
        </div>
      </div>
    </div>
  );
}

export function ReceiptsPrintSection({
  payments,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  payments: ReceiptRow[];
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  if (payments.length === 0) return null;

  return (
    <div className="print:hidden">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Print Individual Receipts</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {payments.map((p) => (
          <PrintableReceipt
            key={p.id}
            receipt={p}
            tenantName={tenantName}
            tenantLogoUrl={tenantLogoUrl}
            tenantBusinessInfo={tenantBusinessInfo}
          />
        ))}
      </div>
    </div>
  );
}
