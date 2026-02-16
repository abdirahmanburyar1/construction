import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminLoginPage() {
  const admin = await getAdminFromSession();
  if (admin) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-800">Platform Admin Login</h1>
      <AdminLoginForm />
    </div>
  );
}
