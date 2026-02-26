"use client";

import { useFormState } from "react-dom";
import { createExpenseAction } from "./actions";
import Link from "next/link";

const CATEGORIES = [
  { value: "MATERIAL", label: "Material" },
  { value: "LABOR", label: "Labor" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "SUBCONTRACT", label: "Subcontract" },
  { value: "OTHER", label: "Other" },
];

type Project = { id: string; name: string };

export function ExpenseForm({
  projects,
  defaultProjectId,
}: {
  projects: Project[];
  defaultProjectId?: string;
}) {
  const [state, formAction] = useFormState(createExpenseAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="projectId" className="mb-1 block text-sm font-medium text-slate-700">Project</label>
        <select id="projectId" name="projectId" required className="input" defaultValue={defaultProjectId}>
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input id="title" name="title" required className="input" placeholder="e.g. Cement delivery" />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">Category</label>
        <select id="category" name="category" required className="input">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" required className="input" />
      </div>
      <div>
        <label htmlFor="expenseDate" className="mb-1 block text-sm font-medium text-slate-700">Date</label>
        <input id="expenseDate" name="expenseDate" type="date" required className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
        <textarea id="description" name="description" rows={2} className="input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">Add</button>
        <Link href="/expenses" className="btn btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
