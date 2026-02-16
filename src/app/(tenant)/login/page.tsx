import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { TenantLoginForm } from "./tenant-login-form";

export default async function TenantLoginPage() {
  const tenant = await getTenantForRequest();
  const session = await getTenantFromSession();
  if (session && session.id === tenant.id) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-xl font-semibold text-slate-800">{tenant.companyName}</h1>
      <p className="mb-6 text-sm text-slate-500">Sign in to your account</p>
      <TenantLoginForm />
    </div>
  );
}
