import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminFromSession } from "@/lib/auth";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";
import { TenantLoginForm } from "./tenant-login-form";

export default async function LoginPage() {
  const headersList = await headers();
  const slug = headersList.get("x-tenant-slug");

  if (slug) {
    const tenant = await getTenantForRequest();
    const session = await getTenantFromSession();
    if (session && session.tenantId === tenant.id) redirect("/dashboard");

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[400px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{tenant.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
            <div className="mt-8">
              <TenantLoginForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const admin = await getAdminFromSession();
  if (admin) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage tenants and subscriptions</p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
