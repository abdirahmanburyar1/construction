import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { NavLink } from "@/components/NavLink";

export async function TenantNav() {
  const tenant = await getTenantForRequest();
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link
            href="/dashboard"
            className="truncate text-lg font-bold tracking-tight text-slate-900"
          >
            {tenant.companyName}
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/materials">Materials</NavLink>
            <NavLink href="/expenses">Expenses</NavLink>
            <NavLink href="/clients">Clients</NavLink>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-sm text-slate-500 sm:inline" title={tenant.email}>
            {tenant.email}
          </span>
          <form action="/api/tenant-logout" method="POST">
            <button type="submit" className="btn btn-ghost text-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
