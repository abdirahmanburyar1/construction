"use client";

import { useFormState } from "react-dom";
import { adminLoginAction } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [state, formAction] = useFormState(adminLoginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn btn-primary w-full">
        Sign in
      </button>
    </form>
  );
}
