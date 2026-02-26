import Link from "next/link";
import { NavLink } from "@/components/NavLink";

export function TenantNav({
  userEmail,
  tenantName,
}: {
  userEmail: string;
  tenantName: string;
}) {
  return (
    <div className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/" className="truncate text-lg font-bold tracking-tight text-slate-900">
          {tenantName}
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Main">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/projects">Projects</NavLink>
        <NavLink href="/materials">Materials</NavLink>
        <NavLink href="/expenses">Expenses</NavLink>
        <NavLink href="/clients">Clients</NavLink>
      </nav>
      <div className="border-t border-slate-200 p-3">
        <p className="truncate px-3 py-2 text-xs text-slate-500" title={userEmail}>
          {userEmail}
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
