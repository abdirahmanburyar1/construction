"use client";

import { useFormState } from "react-dom";
import { createTenantAction } from "@/app/admin/tenants/actions";
import Link from "next/link";

export function CreateTenantForm() {
  const [state, formAction] = useFormState(createTenantAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-slate-700">
          Company name
        </label>
        <input id="companyName" name="companyName" required className="input" />
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-700">
          Slug (subdomain)
        </label>
        <input id="slug" name="slug" required className="input" placeholder="e.g. abc" />
        <p className="mt-1 text-xs text-slate-500">Used as subdomain: slug.dhisme.so</p>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input id="password" name="password" type="password" required className="input" />
      </div>
      <div>
        <label htmlFor="subscriptionStatus" className="mb-1 block text-sm font-medium text-slate-700">
          Subscription status
        </label>
        <select id="subscriptionStatus" name="subscriptionStatus" className="input">
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="subscriptionStartDate" className="mb-1 block text-sm font-medium text-slate-700">
            Start date
          </label>
          <input id="subscriptionStartDate" name="subscriptionStartDate" type="date" className="input" />
        </div>
        <div>
          <label htmlFor="subscriptionExpiryDate" className="mb-1 block text-sm font-medium text-slate-700">
            Expiry date
          </label>
          <input id="subscriptionExpiryDate" name="subscriptionExpiryDate" type="date" className="input" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Create
        </button>
        <Link href="/admin/tenants" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
