import { getAdminFromSession } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();

  return (
    <div className="min-h-screen bg-slate-100/80">
      {admin ? (
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
            <nav className="flex items-center gap-1" aria-label="Admin">
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-900"
              >
                Platform Admin
              </Link>
              <Link
                href="/admin/tenants"
                className="nav-link"
              >
                Tenants
              </Link>
            </nav>
            <form action="/api/admin-logout" method="POST">
              <button type="submit" className="btn btn-ghost text-sm">
                Log out
              </button>
            </form>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
