import { redirect } from "next/navigation";
<<<<<<< HEAD
import { getOrganization } from "@/lib/organization-context";
import { getUserFromSession } from "@/lib/auth";
import { TenantLoginForm } from "./tenant-login-form";

export default async function LoginPage() {
  let org;
  try {
    org = await getOrganization();
  } catch {
    redirect("/contact");
  }

  const session = await getUserFromSession();
  if (session) {
=======
import { headers } from "next/headers";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getAdminFromSession, getTenantFromSession } from "@/lib/auth";
import { getSubdomain, getTenantBySlug } from "@/lib/tenant";
import { TenantLoginForm } from "./tenant-login-form";
import { AdminLoginForm } from "./admin-login-form";

export default async function LoginPage() {
  const h = await headers();
  const host = h.get("host") ?? h.get("x-forwarded-host") ?? "";
  const slugFromHeader = h.get("x-tenant-slug") ?? null;
  const slugFromHost = getSubdomain(host);
  const slug = slugFromHeader ?? slugFromHost;

  // 1. Platform Admin Login (dhisme.so)
  if (!slug) {
    const adminSession = await getAdminFromSession();
    if (adminSession) {
      redirect("/tenants");
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Admin</h1>
            <p className="mt-2 text-sm text-slate-600">Dhisme Construction Management</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <AdminLoginForm />
          </div>
          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            Authorized personnel only
          </p>
        </div>
      </div>
    );
  }

  // 2. Tenant Login (*.dhisme.so)
  const tenantExists = await getTenantBySlug(slug);
  if (!tenantExists) {
    redirect("/contact");
  }

  const tenant = await getTenantForRequest();
  const session = await getTenantFromSession();
  
  if (session && session.tenantId === tenant.id) {
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
<<<<<<< HEAD
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{org.name}</h1>
=======
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{tenant.name}</h1>
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
          <div className="mt-8">
            <TenantLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
