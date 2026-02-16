import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { TenantLoginForm } from "./tenant-login-form";

export default async function TenantLoginPage() {
  const tenant = await getTenantForRequest();
  const session = await getTenantFromSession();
  if (session && session.id === tenant.id) redirect("/dashboard");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="card">
          <h1 className="page-title">{tenant.companyName}</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
          <div className="mt-8">
            <TenantLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
