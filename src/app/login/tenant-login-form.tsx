"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tenantLoginAction } from "@/app/(tenant)/actions";

export function TenantLoginForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(tenantLoginAction, null);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.replace("/dashboard");
    }
  }, [state, router]);

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
      {state && "error" in state && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button type="submit" className="btn btn-primary w-full">
        Sign in
      </button>
    </form>
  );
}
