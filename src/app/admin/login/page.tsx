import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminLoginPage() {
  const admin = await getAdminFromSession();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="card">
          <h1 className="page-title">Platform Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage tenants and subscriptions</p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
