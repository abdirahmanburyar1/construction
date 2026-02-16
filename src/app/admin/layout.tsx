import { getAdminFromSession } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();

  return (
    <div className="min-h-screen bg-slate-100">
      {admin ? (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/admin" className="font-semibold text-slate-800">
              Platform Admin
            </Link>
            <form action="/api/admin-logout" method="POST">
              <button type="submit" className="btn btn-secondary text-sm">
                Log out
              </button>
            </form>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
