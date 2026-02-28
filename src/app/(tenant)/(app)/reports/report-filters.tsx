"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { SearchableSelect, type SearchableSelectOption } from "@/components/SearchableSelect";

type ReportFiltersProps = {
  projects: { id: string; name: string; clientId: string | null }[];
  clients: { id: string; name: string }[];
  categories: string[];
  materials: { id: string; name: string; category: string | null }[];
};

export function ReportFilters({ projects, clients, categories, materials }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";
  const projectIdParam = searchParams.get("projectId") ?? "";
  const clientIdParam = searchParams.get("clientId") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const materialIdParam = searchParams.get("materialId") ?? "";

  const [projectId, setProjectId] = useState(projectIdParam);
  const [clientId, setClientId] = useState(clientIdParam);
  const [category, setCategory] = useState(categoryParam);
  const [materialId, setMaterialId] = useState(materialIdParam);

  useEffect(() => {
    setProjectId(projectIdParam);
    setClientId(clientIdParam);
    setCategory(categoryParam);
    setMaterialId(materialIdParam);
  }, [projectIdParam, clientIdParam, categoryParam, materialIdParam]);

  const clientOptions: SearchableSelectOption[] = [
    { value: "", label: "All clients" },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];
  const projectsForClient = clientId
    ? projects.filter((p) => p.clientId === clientId)
    : projects;
  const projectOptions: SearchableSelectOption[] = [
    { value: "", label: "All projects" },
    ...projectsForClient.map((p) => ({ value: p.id, label: p.name })),
  ];
  const categoryOptions: SearchableSelectOption[] = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const materialsInCategory = category
    ? materials.filter((m) => m.category === category)
    : materials;
  const materialOptions: SearchableSelectOption[] = [
    { value: "", label: "All materials" },
    ...materialsInCategory.map((m) => ({ value: m.id, label: m.name })),
  ];

  useEffect(() => {
    const selectedMaterial = materials.find((m) => m.id === materialId);
    if (category && selectedMaterial && selectedMaterial.category !== category) {
      setMaterialId("");
    }
  }, [category, materialId, materials]);

  useEffect(() => {
    const selectedProject = projects.find((p) => p.id === projectId);
    if (clientId && selectedProject && selectedProject.clientId !== clientId) {
      setProjectId("");
    }
  }, [clientId, projectId, projects]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fromVal = (fd.get("from") as string)?.trim() || null;
    const toVal = (fd.get("to") as string)?.trim() || null;

    const params = new URLSearchParams();
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    if (projectId) params.set("projectId", projectId);
    if (clientId) params.set("clientId", clientId);
    if (category) params.set("category", category);
    if (materialId) params.set("materialId", materialId);

    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  }

  function handleClear() {
    setProjectId("");
    setClientId("");
    setCategory("");
    setMaterialId("");
    startTransition(() => {
      router.push("/reports");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="print:hidden">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 w-[140px] shrink-0">
          <label htmlFor="report-from" className="text-xs font-medium text-slate-600">
            From (month)
          </label>
          <input
            id="report-from"
            name="from"
            type="month"
            defaultValue={fromParam}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm w-full"
          />
        </div>
        <div className="flex flex-col gap-1 w-[140px] shrink-0">
          <label htmlFor="report-to" className="text-xs font-medium text-slate-600">
            To (month)
          </label>
          <input
            id="report-to"
            name="to"
            type="month"
            defaultValue={toParam}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm w-full"
          />
        </div>
        <div className="flex flex-col gap-1 w-[220px] shrink-0">
          <label htmlFor="report-client" className="text-xs font-medium text-slate-600">
            Client
          </label>
          <SearchableSelect
            name="clientId"
            value={clientId}
            onChange={setClientId}
            options={clientOptions}
            placeholder="Search clients..."
            className="w-full min-w-0"
            inputClassName="text-sm py-1.5 min-w-0"
          />
        </div>
        <div className="flex flex-col gap-1 w-[220px] shrink-0">
          <label htmlFor="report-project" className="text-xs font-medium text-slate-600">
            Project
          </label>
          <SearchableSelect
            name="projectId"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            placeholder="Search projects..."
            className="w-full min-w-0"
            inputClassName="text-sm py-1.5 min-w-0"
          />
        </div>
        <div className="flex flex-col gap-1 w-[220px] shrink-0">
          <label htmlFor="report-category" className="text-xs font-medium text-slate-600">
            Category
          </label>
          <SearchableSelect
            name="category"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Search categories..."
            className="w-full min-w-0"
            inputClassName="text-sm py-1.5 min-w-0"
          />
        </div>
        <div className="flex flex-col gap-1 w-[220px] shrink-0">
          <label htmlFor="report-material" className="text-xs font-medium text-slate-600">
            Material
          </label>
          <SearchableSelect
            name="materialId"
            value={materialId}
            onChange={setMaterialId}
            options={materialOptions}
            placeholder={category ? "Search materials..." : "Select category first"}
            className="w-full min-w-0"
            inputClassName="text-sm py-1.5 min-w-0"
          />
        </div>
        <div className="flex items-end gap-2 shrink-0">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {isPending ? "Loading…" : "Generate report"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
