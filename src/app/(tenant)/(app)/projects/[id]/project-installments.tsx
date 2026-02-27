"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  createProjectInstallmentAction,
  deleteProjectInstallmentAction,
} from "../actions";
import { useFormAlert } from "@/components/useFormAlert";

type Installment = {
  id: string;
  label: string;
  amount: { toString(): string };
  dueDate: Date;
  sortOrder: number;
};

export function ProjectInstallmentsSection({
  projectId,
  installments,
  embedded,
}: {
  projectId: string;
  installments: Installment[];
  embedded?: boolean;
}) {
  const [state, formAction] = useFormState(createProjectInstallmentAction, null);
  useFormAlert(state);

  const sorted = [...installments].sort(
    (a, b) => a.sortOrder - b.sortOrder || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const content = (
    <>
        <AddInstallmentForm
        projectId={projectId}
        formAction={formAction as unknown as (prev: unknown, formData: FormData) => Promise<{ error?: string } | null>}
      />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 font-semibold text-slate-700">Label</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Amount</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Due date</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{i.label}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(i.amount))}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(i.dueDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteProjectInstallmentAction} className="inline">
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="installmentId" value={i.id} />
                      <button
                        type="submit"
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove installment"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {installments.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">No installments yet. Add one above.</p>
        )}
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Installments</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Payment schedule / milestones for this project
        </p>
      </div>
      <div className="p-5">{content}</div>
    </div>
  );
}

function AddInstallmentForm({
  projectId,
  formAction,
}: {
  projectId: string;
  formAction: (prev: unknown, formData: FormData) => Promise<{ error?: string } | null>;
}) {
  const { pending } = useFormStatus();
  return (
    <form
      action={formAction as unknown as (formData: FormData) => void}
      className="flex flex-wrap items-end gap-3"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <div className="min-w-[120px]">
        <label htmlFor="inst-label" className="mb-1 block text-xs font-medium text-slate-600">Label</label>
        <input
          id="inst-label"
          name="label"
          type="text"
          required
          placeholder="e.g. Deposit, Stage 1"
          className="input w-full"
        />
      </div>
      <div className="min-w-[100px]">
        <label htmlFor="inst-amount" className="mb-1 block text-xs font-medium text-slate-600">Amount</label>
        <input
          id="inst-amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          className="input w-full"
        />
      </div>
      <div className="min-w-[140px]">
        <label htmlFor="inst-dueDate" className="mb-1 block text-xs font-medium text-slate-600">Due date</label>
        <input
          id="inst-dueDate"
          name="dueDate"
          type="date"
          required
          className="input w-full"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Adding…" : "Add installment"}
      </button>
    </form>
  );
}
