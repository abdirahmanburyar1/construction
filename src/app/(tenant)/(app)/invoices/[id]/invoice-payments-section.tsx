"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { createInvoicePaymentAction, deleteInvoicePaymentAction } from "../actions";
import { useFormAlert } from "@/components/useFormAlert";

export type InvoicePaymentRow = {
  id: string;
  amount: { toString(): string };
  paidAt: Date;
  receiptNumber: string | null;
  paymentMethod: string | null;
  reference: string | null;
  accountNo: string | null;
  notes: string | null;
};

export function InvoicePaymentsSection({
  invoiceId,
  invoiceNumber,
  invoiceStatus,
  recipientName,
  grandTotal,
  paidTotal,
  remaining,
  payments,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  invoiceId: string;
  invoiceNumber: string | null;
  invoiceStatus: string;
  recipientName: string | null;
  grandTotal: number;
  paidTotal: number;
  remaining: number;
  payments: InvoicePaymentRow[];
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  const [state, formAction] = useFormState(createInvoicePaymentAction, null);
  const [showAdd, setShowAdd] = useState(false);
  useFormAlert(state && "error" in state ? (state as { error: string }) : null);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      setShowAdd(false);
      Swal.fire({
        title: "Payment recorded",
        text: "The receipt has been saved successfully.",
        icon: "success",
        confirmButtonColor: "#0d9488",
      });
    }
  }, [state]);

  const sorted = [...payments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  const canAddPayment = invoiceStatus !== "DRAFT" && remaining > 0.0001;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payments & receipts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Total due:{" "}
            <span className="font-semibold text-slate-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(grandTotal)}
            </span>
            {" · "}
            Paid:{" "}
            <span className="font-semibold text-teal-700">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(paidTotal)}
            </span>
            {" · "}
            Balance:{" "}
            <span className="font-semibold text-slate-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(remaining)}
            </span>
          </p>
          {invoiceStatus === "DRAFT" && (
            <p className="mt-2 text-xs text-amber-700">Send the invoice before recording payments.</p>
          )}
        </div>
        {canAddPayment && (
          <button type="button" onClick={() => setShowAdd(true)} className="btn btn-primary shrink-0">
            Record payment
          </button>
        )}
      </div>

      {showAdd && (
        <AddPaymentModal
          invoiceId={invoiceId}
          maxAmount={remaining}
          formAction={formAction as unknown as (prev: unknown, formData: FormData) => Promise<{ error?: string } | { success?: boolean } | null>}
          onClose={() => setShowAdd(false)}
        />
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {sorted.map((p) => (
          <PaymentReceiptCard
            key={p.id}
            payment={p}
            invoiceId={invoiceId}
            invoiceNumber={invoiceNumber}
            recipientName={recipientName}
            tenantName={tenantName}
            tenantLogoUrl={tenantLogoUrl}
            tenantBusinessInfo={tenantBusinessInfo}
          />
        ))}
      </div>
      {payments.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">No payments yet. Record a payment to generate a receipt.</p>
      )}
    </div>
  );
}

function PaymentSlipBody({
  paidDate,
  amountFormatted,
  payment,
  invoiceLabel,
  recipientName,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
  copyLabel,
}: {
  paidDate: string;
  amountFormatted: string;
  payment: InvoicePaymentRow;
  invoiceLabel: string;
  recipientName: string | null;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
  copyLabel?: string;
}) {
  return (
    <div className="receipt-slip bg-[#faf8f5] p-6 min-h-[380px] flex flex-col print:min-h-0 print:p-4">
      {copyLabel && (
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 print:mb-1">
          {copyLabel}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row">
        <div className="flex-shrink-0">
          {tenantLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenantLogoUrl}
              alt="Company logo"
              className="h-14 w-14 object-contain object-left sm:h-16 sm:w-16 print:h-12 print:w-12"
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white sm:h-16 sm:w-16 print:h-12 print:w-12">
              <span className="text-xs font-medium text-slate-400">Logo</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <h2 className="inline-block rounded-lg border-2 border-teal-600 px-4 py-2 text-center text-lg font-bold text-teal-700 sm:text-xl print:text-base">
            MONEY RECEIPT
          </h2>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-semibold text-teal-700">{tenantName}</p>
          {tenantBusinessInfo && (
            <p className="mt-1 max-w-[200px] text-xs leading-snug text-slate-600 sm:max-w-[240px]">
              {tenantBusinessInfo}
            </p>
          )}
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">Date:</span> {paidDate}
          </p>
        </div>
      </div>
      <div className="mt-6 flex-1 space-y-3 text-sm print:mt-4 print:space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-slate-600">Receipt No:</span>
          <span className="font-semibold text-slate-900">{payment.receiptNumber ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <span className="text-slate-600">Received with thanks from:</span>
          <span className="border-b border-slate-400 border-dotted font-medium text-slate-900">{recipientName ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <span className="text-slate-600">Payment method:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{payment.paymentMethod ?? "—"}</span>
          <span className="ml-2 text-slate-600">Account No:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{payment.accountNo ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <span className="text-slate-600">Reference:</span>
          <span className="border-b border-slate-400 border-dotted text-slate-900">{payment.reference ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <span className="text-slate-600">For invoice:</span>
          <span className="border-b border-slate-400 border-dotted font-medium text-slate-900">
            {invoiceLabel}
            {payment.notes ? ` — ${payment.notes}` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="text-slate-600">Amount:</span>
          <span className="inline-block border-2 border-slate-700 bg-white px-3 py-1.5 font-bold text-slate-900">
            {amountFormatted}
          </span>
        </div>
      </div>
      <div
        className="-mx-6 -mb-6 mt-auto h-4 bg-gradient-to-r from-teal-700 to-teal-500 print:mx-0 print:mb-0 print:mt-4"
        aria-hidden
      />
    </div>
  );
}

function PaymentReceiptCard({
  payment,
  invoiceId,
  invoiceNumber,
  recipientName,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  payment: InvoicePaymentRow;
  invoiceId: string;
  invoiceNumber: string | null;
  recipientName: string | null;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const receiptEl = printRef.current;
    if (!receiptEl) return;
    const body = document.body;
    const originalClass = body.className;
    body.classList.add("print-single-receipt");
    receiptEl.classList.add("print-this-receipt");
    window.print();
    body.className = originalClass;
    receiptEl.classList.remove("print-this-receipt");
  };

  const amount = Number(payment.amount);
  const paidDate = new Date(payment.paidAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const amountFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const invoiceLabel = invoiceNumber || "—";

  const slipProps = {
    paidDate,
    amountFormatted,
    payment,
    invoiceLabel,
    recipientName,
    tenantName,
    tenantLogoUrl,
    tenantBusinessInfo,
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
      <div className="receipt-slip-wrapper print:hidden">
        <PaymentSlipBody {...slipProps} />
      </div>
      <div ref={printRef} className="hidden print:!block receipt-two-copies" aria-hidden>
        <div className="receipt-copy">
          <PaymentSlipBody {...slipProps} copyLabel="Customer copy" />
        </div>
        <div className="receipt-copy">
          <PaymentSlipBody {...slipProps} copyLabel="Office copy" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          Print receipt
        </button>
        <form action={deleteInvoicePaymentAction} className="inline">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <input type="hidden" name="paymentId" value={payment.id} />
          <button
            type="submit"
            className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove payment"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPaymentModal({
  invoiceId,
  maxAmount,
  formAction,
  onClose,
}: {
  invoiceId: string;
  maxAmount: number;
  formAction: (prev: unknown, formData: FormData) => Promise<{ error?: string } | { success?: boolean } | null>;
  onClose: () => void;
}) {
  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-payment-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="add-payment-title" className="text-lg font-semibold text-slate-800">
          Record payment
        </h2>
        <p className="mt-1 text-sm text-slate-500">Balance due: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(maxAmount)}</p>
        <form action={formAction as unknown as (formData: FormData) => void} className="mt-4 space-y-4">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <AddPaymentFields onClose={onClose} maxAmount={maxAmount} />
        </form>
      </div>
    </div>
  );
  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}

function AddPaymentFields({ onClose, maxAmount }: { onClose: () => void; maxAmount: number }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80" aria-live="polite" aria-busy="true">
          <div className="flex flex-col items-center gap-3">
            <svg className="h-10 w-10 animate-spin text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium text-slate-700">Saving…</span>
          </div>
        </div>
      )}
      <fieldset disabled={pending} className="space-y-4">
        <div>
          <label htmlFor="pay-amount" className="mb-1 block text-sm font-medium text-slate-700">
            Amount
          </label>
          <input
            id="pay-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            required
            placeholder="0.00"
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="pay-paidAt" className="mb-1 block text-sm font-medium text-slate-700">
            Date received
          </label>
          <input
            id="pay-paidAt"
            name="paidAt"
            type="date"
            className="input w-full"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <label htmlFor="pay-method" className="mb-1 block text-sm font-medium text-slate-700">
            Payment method
          </label>
          <input
            id="pay-method"
            name="paymentMethod"
            type="text"
            placeholder="e.g. Cash, Bank transfer"
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="pay-account" className="mb-1 block text-sm font-medium text-slate-700">
            Account No
          </label>
          <input id="pay-account" name="accountNo" type="text" placeholder="Optional" className="input w-full" />
        </div>
        <div>
          <label htmlFor="pay-ref" className="mb-1 block text-sm font-medium text-slate-700">
            Reference
          </label>
          <input id="pay-ref" name="reference" type="text" placeholder="Optional" className="input w-full" />
        </div>
        <div>
          <label htmlFor="pay-notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <input id="pay-notes" name="notes" type="text" placeholder="Optional" className="input w-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary inline-flex items-center gap-2" disabled={pending}>
            {pending ? "Saving…" : "Save payment"}
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={pending}>
            Cancel
          </button>
        </div>
      </fieldset>
    </>
  );
}
