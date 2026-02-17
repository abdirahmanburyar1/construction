import { getAdminFromSession } from "@/lib/auth";
import Link from "next/link";
import { AdminNavLink } from "@/components/AdminNavLink";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();

  return (
    <div className="min-h-screen bg-slate-100">
      {admin ? (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center border-b border-slate-200 px-5">
              <Link href="/admin" className="text-lg font-bold tracking-tight text-slate-900">
                Platform Admin
              </Link>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin">
              <AdminNavLink href="/admin">Dashboard</AdminNavLink>
              <AdminNavLink href="/admin/tenants">Tenants</AdminNavLink>
            </nav>
            <div className="border-t border-slate-200 p-3">
              <form action="/api/admin-logout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Log out
                </button>
              </form>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
