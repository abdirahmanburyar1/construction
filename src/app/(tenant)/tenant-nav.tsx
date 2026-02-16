import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";

export async function TenantNav() {
  const tenant = await getTenantForRequest();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold text-teal-800">
            {tenant.companyName}
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-slate-600 hover:text-teal-700">
              Dashboard
            </Link>
            <Link href="/projects" className="text-slate-600 hover:text-teal-700">
              Projects
            </Link>
            <Link href="/materials" className="text-slate-600 hover:text-teal-700">
              Materials
            </Link>
            <Link href="/expenses" className="text-slate-600 hover:text-teal-700">
              Expenses
            </Link>
            <Link href="/clients" className="text-slate-600 hover:text-teal-700">
              Clients
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{tenant.email}</span>
          <form action="/api/tenant-logout" method="POST">
            <button type="submit" className="btn btn-secondary text-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
