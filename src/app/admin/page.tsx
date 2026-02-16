import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const admin = await getAdminFromSession();
  if (!admin) redirect("/admin/login");

  const [totalTenants, activeTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: "ACTIVE" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-slate-500">Total Tenants</p>
          <p className="text-2xl font-semibold text-slate-800">{totalTenants}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Active Subscriptions</p>
          <p className="text-2xl font-semibold text-slate-800">{activeTenants}</p>
        </div>
      </div>
      <div>
        <Link href="/admin/tenants" className="btn btn-primary">
          Manage tenants
        </Link>
      </div>
    </div>
  );
}
