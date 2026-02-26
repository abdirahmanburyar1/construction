import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { getSubdomain } from "@/lib/tenant";
import { TenantNav } from "@/app/(tenant)/tenant-nav";
import { DashboardContent } from "@/app/(tenant)/(app)/dashboard/dashboard-content";

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "dhisme.so";

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  const slug = headersList.get("x-tenant-slug") || getSubdomain(host);

  if (slug) {
    const tenant = await getTenantForRequest();
    const session = await getTenantFromSession();
    if (!session || session.tenantId !== tenant.id) {
      redirect("/login");
    }
    return (
      <div className="flex min-h-screen bg-slate-100">
        <TenantNav userEmail={session.email} tenantName={tenant.name} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <DashboardContent />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Construction Management
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Sign in at your company&apos;s subdomain, for example:
        </p>
        <p className="mt-2 font-mono text-sm font-medium text-teal-700">
          https://company.{PLATFORM_DOMAIN}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300"
          >
            Go to login
          </Link>
          <Link
            href="/contact"
            className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
