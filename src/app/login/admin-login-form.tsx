"use client";

import { useFormState } from "react-dom";
import { adminLoginAction } from "@/app/(platform)/actions";

export function AdminLoginForm() {
  const [state, formAction] = useFormState(adminLoginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn btn-primary w-full">
        Sign in
      </button>
    </form>
  );
}
