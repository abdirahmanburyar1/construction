"use client";

import { useFormState } from "react-dom";
import { createMaterialAction } from "./actions";
import Link from "next/link";

export function MaterialForm() {
  const [state, formAction] = useFormState(createMaterialAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Material name
        </label>
        <input id="name" name="name" required className="input" placeholder="e.g. Cement, Steel rebar" />
      </div>
      <div>
        <label htmlFor="unit" className="mb-1 block text-sm font-medium text-slate-700">
          Unit
        </label>
        <input id="unit" name="unit" required className="input" placeholder="e.g. kg, m², bags" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">Add</button>
        <Link href="/materials" className="btn btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
