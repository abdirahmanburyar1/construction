"use client";

import { useFormState } from "react-dom";
import { updateTenantAction } from "./actions";
import Link from "next/link";
import type { Tenant } from "@prisma/client";

export function EditTenantForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction] = useFormState(updateTenantAction, null);

  const start = tenant.subscriptionStartDate
    ? new Date(tenant.subscriptionStartDate).toISOString().slice(0, 10)
    : "";
  const expiry = tenant.subscriptionExpiryDate
    ? new Date(tenant.subscriptionExpiryDate).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <input type="hidden" name="id" value={tenant.id} />
      <div>
        <label htmlFor="companyName" className="label">Company name</label>
        <input id="companyName" name="companyName" required className="input" defaultValue={tenant.companyName} />
      </div>
      <div>
        <label htmlFor="slug" className="label">Slug (subdomain)</label>
        <input id="slug" name="slug" required className="input" defaultValue={tenant.slug} />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" defaultValue={tenant.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">New password (leave blank to keep)</label>
        <input id="password" name="password" type="password" className="input" />
      </div>
      <div>
        <label htmlFor="subscriptionStatus" className="label">Subscription status</label>
        <select id="subscriptionStatus" name="subscriptionStatus" className="input" defaultValue={tenant.subscriptionStatus}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="subscriptionStartDate" className="label">Start date</label>
          <input id="subscriptionStartDate" name="subscriptionStartDate" type="date" className="input" defaultValue={start} />
        </div>
        <div>
          <label htmlFor="subscriptionExpiryDate" className="label">Expiry date</label>
          <input id="subscriptionExpiryDate" name="subscriptionExpiryDate" type="date" className="input" defaultValue={expiry} />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <Link href="/tenants" className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
