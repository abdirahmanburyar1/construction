"use client";

import { useRef } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { tenantLogoutAction } from "@/app/(tenant)/actions";

export function AppNavbar({
  userEmail,
  tenantName,
  onMenuClick,
}: {
  userEmail: string;
  tenantName: string;
  onMenuClick?: () => void;
}) {
  const logoutFormRef = useRef<HTMLFormElement>(null);

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await Swal.fire({
      title: "Log out?",
      text: "You will need to sign in again to access the app.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Log out",
    });
    if (result.isConfirmed && logoutFormRef.current) {
      logoutFormRef.current.requestSubmit();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex lg:hidden -ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        )}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 font-bold text-white shadow-sm">
            {tenantName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden font-semibold text-slate-800 sm:inline">{tenantName}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden flex-col items-end sm:flex">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Logged in as
          </p>
          <p className="truncate max-w-[140px] lg:max-w-[180px] text-sm font-semibold text-slate-900" title={userEmail}>
            {userEmail}
          </p>
        </div>
        <form ref={logoutFormRef} action={tenantLogoutAction}>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 sm:px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="hidden sm:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
