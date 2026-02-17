import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { headers } from "next/headers";

export default async function PlatformDashboardPage() {
  const headersList = await headers();
  if (headersList.get("x-tenant-slug")) redirect("/dashboard");

  const admin = await getAdminFromSession();
  if (!admin) redirect("/login");

  const [totalTenants, activeTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: "ACTIVE" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and tenant management</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tenants</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalTenants}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeTenants}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Quick actions</h2>
        <p className="mt-1 text-sm text-slate-500">Create and manage tenant accounts and subscriptions.</p>
        <Link href="/tenants" className="mt-4 inline-flex rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700">
          Manage tenants
        </Link>
      </div>
    </div>
  );
}
