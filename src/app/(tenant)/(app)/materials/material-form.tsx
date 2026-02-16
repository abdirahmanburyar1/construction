"use client";

import { useFormState } from "react-dom";
import { createMaterialAction } from "./actions";
import Link from "next/link";

type Project = { id: string; name: string };

export function MaterialForm({
  projects,
  defaultProjectId,
}: {
  projects: Project[];
  defaultProjectId?: string;
}) {
  const [state, formAction] = useFormState(createMaterialAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="projectId" className="mb-1 block text-sm font-medium text-slate-700">
          Project
        </label>
        <select id="projectId" name="projectId" required className="input" defaultValue={defaultProjectId}>
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Material name
        </label>
        <input id="name" name="name" required className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input id="quantity" name="quantity" type="number" step="any" min="0" required className="input" />
        </div>
        <div>
          <label htmlFor="unit" className="mb-1 block text-sm font-medium text-slate-700">
            Unit
          </label>
          <input id="unit" name="unit" required className="input" placeholder="e.g. kg, m²" />
        </div>
      </div>
      <div>
        <label htmlFor="unitPrice" className="mb-1 block text-sm font-medium text-slate-700">
          Unit price
        </label>
        <input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required className="input" />
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={2} className="input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Add
        </button>
        <Link href="/materials" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
