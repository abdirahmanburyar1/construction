import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { getSubdomain } from "@/lib/tenant";
import { TenantLoginForm } from "./tenant-login-form";
import Link from "next/link";

export default async function LoginPage() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const slug = headersList.get("x-tenant-slug") || getSubdomain(host);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-3 text-sm text-slate-600">
          Use your company&apos;s subdomain to sign in (e.g. company.dhisme.so).
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
