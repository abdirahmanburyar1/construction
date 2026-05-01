import { redirect } from "next/navigation";
import { getAdminFromSession } from "@/lib/auth";
import Link from "next/link";
import { PlatformNav } from "./platform-nav";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();

  if (!admin) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <PlatformNav />
      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
