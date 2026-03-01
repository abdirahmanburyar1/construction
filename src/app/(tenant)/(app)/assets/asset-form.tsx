"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAssetAction, updateAssetAction } from "./actions";
import Link from "next/link";
import { useFormAlert } from "@/components/useFormAlert";

const CATEGORIES = [
  { value: "FIXED", label: "Fixed" },
  { value: "CURRENT", label: "Current" },
] as const;

type AssetForForm = {
  id: string;
  name: string;
  category: string;
  cost: { toString(): string };
};

export function AssetForm({ asset }: { asset?: AssetForForm }) {
  const [state, formAction] = useFormState(
    asset ? updateAssetAction : createAssetAction,
    null
  );
  useFormAlert(state);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {asset && <input type="hidden" name="id" value={asset.id} />}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Asset name
        </label>
        <input
          id="name"
          name="name"
          required
          className="input"
          placeholder="e.g. Excavator, Office building"
          defaultValue={asset?.name}
        />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          className="input"
          defaultValue={asset?.category ?? "FIXED"}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cost" className="mb-1 block text-sm font-medium text-slate-700">
          Cost
        </label>
        <input
          id="cost"
          name="cost"
          type="number"
          step="0.01"
          min="0"
          required
          className="input"
          placeholder="0.00"
          defaultValue={asset?.cost != null ? String(asset.cost) : ""}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <SubmitButton asset={asset} />
        <Link href="/assets" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ asset }: { asset?: AssetForForm }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary inline-flex items-center gap-2"
      disabled={pending}
    >
      {pending && (
        <svg
          className="h-4 w-4 shrink-0 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {pending ? (asset ? "Saving…" : "Adding…") : (asset ? "Save changes" : "Add asset")}
    </button>
  );
}
