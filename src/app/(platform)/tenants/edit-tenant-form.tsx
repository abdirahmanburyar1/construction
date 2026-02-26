"use client";

import { useFormState } from "react-dom";
import { updateTenantAction } from "./actions";
import Link from "next/link";

type TenantEdit = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  subscriptionExpiryAt: Date | null;
};

export function EditTenantForm({
  tenant,
  adminEmail,
}: {
  tenant: TenantEdit;
  adminEmail: string;
}) {
  const [state, formAction] = useFormState(updateTenantAction, null);

  const expiry = tenant.subscriptionExpiryAt
    ? new Date(tenant.subscriptionExpiryAt).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <input type="hidden" name="id" value={tenant.id} />
      <div>
        <label htmlFor="companyName" className="label">Company name</label>
        <input id="companyName" name="companyName" required className="input" defaultValue={tenant.name} />
      </div>
      <div>
        <label htmlFor="slug" className="label">Subdomain</label>
        <input id="slug" name="slug" required className="input" defaultValue={tenant.subdomain} />
      </div>
      <div>
        <label htmlFor="email" className="label">Admin email</label>
        <input id="email" name="email" type="email" required className="input" defaultValue={adminEmail} />
      </div>
      <div>
        <label htmlFor="password" className="label">New password (leave blank to keep)</label>
        <input id="password" name="password" type="password" className="input" />
      </div>
      <div>
        <label htmlFor="subscriptionStatus" className="label">Subscription status</label>
        <select id="subscriptionStatus" name="subscriptionStatus" className="input" defaultValue={tenant.status}>
          <option value="TRIAL">TRIAL</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>
      <div>
        <label htmlFor="subscriptionExpiryDate" className="label">Expiry date</label>
        <input id="subscriptionExpiryDate" name="subscriptionExpiryDate" type="date" className="input" defaultValue={expiry} />
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
