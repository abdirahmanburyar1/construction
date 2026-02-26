"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createTenantAction } from "./actions";
import Link from "next/link";

function slugFromInput(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "";
}

export function CreateTenantForm({
  platformDomain,
  protocol,
}: {
  platformDomain: string;
  protocol: string;
}) {
  const [state, formAction] = useFormState(createTenantAction, null);
  const [slugPreview, setSlugPreview] = useState("");

  const tenantUrl = slugPreview
    ? `${protocol}://${slugPreview}.${platformDomain}`
    : "";

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label htmlFor="companyName" className="label">Company name</label>
        <input id="companyName" name="companyName" required className="input" />
      </div>
      <div>
        <label htmlFor="slug" className="label">Slug (subdomain)</label>
        <input
          id="slug"
          name="slug"
          required
          className="input"
          placeholder="e.g. acme"
          onChange={(e) => setSlugPreview(slugFromInput(e.target.value))}
        />
        <p className="mt-1 text-xs text-slate-500">
          The subdomain is created when you save. Only letters, numbers, and hyphens.
        </p>
        {tenantUrl && (
          <p className="mt-2 text-sm font-medium text-teal-700">
            Tenant URL: <a href={tenantUrl} target="_blank" rel="noopener noreferrer" className="underline">{tenantUrl}</a>
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required className="input" />
      </div>
      <div>
        <label htmlFor="subscriptionStatus" className="label">Subscription status</label>
        <select id="subscriptionStatus" name="subscriptionStatus" className="input">
          <option value="TRIAL">TRIAL</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>
      <div>
        <label htmlFor="subscriptionExpiryDate" className="label">Expiry date</label>
        <input id="subscriptionExpiryDate" name="subscriptionExpiryDate" type="date" className="input" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Create
        </button>
        <Link href="/tenants" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
