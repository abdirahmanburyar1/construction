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
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and tenant management</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="stat-card">
          <span className="stat-label">Total Tenants</span>
          <span className="stat-value">{totalTenants}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Subscriptions</span>
          <span className="stat-value">{activeTenants}</span>
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
