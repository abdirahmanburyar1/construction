import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { NavLink } from "@/components/NavLink";

export async function TenantNav() {
  const tenant = await getTenantForRequest();
  return (
    <div className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/dashboard" className="truncate text-lg font-bold tracking-tight text-slate-900">
          {tenant.companyName}
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Main">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/projects">Projects</NavLink>
        <NavLink href="/materials">Materials</NavLink>
        <NavLink href="/expenses">Expenses</NavLink>
        <NavLink href="/clients">Clients</NavLink>
      </nav>
      <div className="border-t border-slate-200 p-3">
        <p className="truncate px-3 py-2 text-xs text-slate-500" title={tenant.email}>
          {tenant.email}
        </p>
        <form action="/api/tenant-logout" method="POST">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
