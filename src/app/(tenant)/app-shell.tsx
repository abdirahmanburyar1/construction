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
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="print:hidden">
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
      </div>
      <main className="min-h-screen overflow-auto pt-14 lg:ml-56 print:ml-0 print:pt-0">
        <div className="w-full p-4 sm:p-6 print:p-0">{children}</div>
      </main>
    </div>
  );
}
