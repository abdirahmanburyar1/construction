import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminLoginPage() {
  const admin = await getAdminFromSession();
  if (admin) redirect("/admin");

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
