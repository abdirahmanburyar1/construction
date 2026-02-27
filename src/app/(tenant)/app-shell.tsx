"use client";

import { useState } from "react";
import { AppNavbar } from "./app-navbar";
import { TenantNav } from "./tenant-nav";

export function AppShell({
  userEmail,
  tenantName,
  children,
}: {
  userEmail: string;
  tenantName: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <AppNavbar
        userEmail={userEmail}
        tenantName={tenantName}
        onMenuClick={() => setSidebarOpen(true)}
      />
      {/* Backdrop: mobile only, when sidebar open */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-10 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <TenantNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="min-h-screen overflow-auto pt-14 lg:ml-56">
        <div className="w-full p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
