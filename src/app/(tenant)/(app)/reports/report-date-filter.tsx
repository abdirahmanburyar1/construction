"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ReportDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fromVal = (fd.get("from") as string)?.trim() || null;
    const toVal = (fd.get("to") as string)?.trim() || null;
    const params = new URLSearchParams();
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  }

  function handleClear() {
    startTransition(() => {
      router.push("/reports");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 print:hidden">
      <div className="flex flex-col gap-1">
        <label htmlFor="report-from" className="text-xs font-medium text-slate-600">
          From
        </label>
        <input
          id="report-from"
          name="from"
          type="date"
          defaultValue={from}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="report-to" className="text-xs font-medium text-slate-600">
          To
        </label>
        <input
          id="report-to"
          name="to"
          type="date"
          defaultValue={to}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {isPending ? "Applying…" : "Apply"}
      </button>
      <button
        type="button"
        onClick={handleClear}
        disabled={isPending}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        Clear
      </button>
    </form>
  );
}
