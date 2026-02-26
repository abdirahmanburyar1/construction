import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { tenantLogoutAction } from "@/app/(tenant)/actions";
import { 
  LayoutDashboardIcon, 
  FolderKanbanIcon, 
  PackageIcon, 
  ReceiptIcon, 
  UsersIcon, 
  LogOutIcon 
} from "lucide-react";

export function TenantNav({
  userEmail,
  tenantName,
}: {
  userEmail: string;
  tenantName: string;
}) {
  return (
    <div className="flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 font-bold text-white shadow-sm">
            {tenantName.charAt(0).toUpperCase()}
          </div>
          <Link href="/" className="truncate text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-teal-700">
            {tenantName}
          </Link>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 p-4" aria-label="Main">
        <NavLink href="/">
          <LayoutDashboardIcon className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink href="/projects">
          <FolderKanbanIcon className="h-5 w-5 mr-3" />
          Projects
        </NavLink>
        <NavLink href="/materials">
          <PackageIcon className="h-5 w-5 mr-3" />
          Materials
        </NavLink>
        <NavLink href="/expenses">
          <ReceiptIcon className="h-5 w-5 mr-3" />
          Expenses
        </NavLink>
        <NavLink href="/clients">
          <UsersIcon className="h-5 w-5 mr-3" />
          Clients
        </NavLink>
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 px-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Logged in as</p>
          <p className="truncate text-sm font-medium text-slate-900" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <form action={tenantLogoutAction}>
          <button
            type="submit"
            className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOutIcon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-slate-500" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
