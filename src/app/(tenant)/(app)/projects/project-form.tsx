"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { createProjectAction, updateProjectAction } from "./actions";
import Link from "next/link";
import { useFormAlert } from "@/components/useFormAlert";
import { SearchableSelect } from "@/components/SearchableSelect";

const STATUSES: { value: string; label: string }[] = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type ProjectForForm = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  budget: { toString(): string };
  status: string;
  startDate: Date;
  endDate: Date | null;
  clientId: string | null;
};

type Client = { id: string; name: string };

export function ProjectForm({
  project,
  clients = [],
}: {
  project?: ProjectForForm;
  clients?: Client[];
}) {
  const [state, formAction] = useFormState(project ? updateProjectAction : createProjectAction, null);
  useFormAlert(state);

  const startStr = project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "";
  const endStr = project?.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="space-y-6">
      {project && <input type="hidden" name="id" value={project.id} />}
      <ProjectFormFields
        project={project}
        clients={clients}
        startStr={startStr}
        endStr={endStr}
        STATUSES={STATUSES}
      />
    </form>
  );
}

function ProjectFormFields({
  project,
  clients,
  startStr,
  endStr,
  STATUSES,
}: {
  project?: ProjectForForm;
  clients: Client[];
  startStr: string;
  endStr: string;
  STATUSES: { value: string; label: string }[];
}) {
  const { pending } = useFormStatus();
  const [clientId, setClientId] = useState(project?.clientId ?? "");

  const clientOptions = [
    { value: "", label: "None" },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <fieldset disabled={pending} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            id="name"
            name="name"
            required
            className="input"
            placeholder="e.g. Office Building Phase 1"
            defaultValue={project?.name}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="input resize-none"
            placeholder="Brief description of the project"
            defaultValue={project?.description ?? ""}
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input
            id="location"
            name="location"
            className="input"
            placeholder="e.g. 123 Main St, City"
            defaultValue={project?.location ?? ""}
          />
        </div>
        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium text-slate-700">Budget</label>
          <input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            required
            className="input"
            placeholder="0.00"
            defaultValue={project?.budget != null ? String(project.budget) : ""}
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select id="status" name="status" className="input" defaultValue={project?.status ?? "PLANNING"}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-slate-700">Client</label>
          <SearchableSelect
            name="clientId"
            value={clientId}
            onChange={setClientId}
            options={clientOptions}
            placeholder="Select client"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
          <input id="startDate" name="startDate" type="date" required className="input" defaultValue={startStr} />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-slate-700">End date</label>
          <input id="endDate" name="endDate" type="date" className="input" defaultValue={endStr} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <button
          type="submit"
          className="btn btn-primary inline-flex items-center gap-2"
          disabled={pending}
        >
          {pending && (
            <svg
              className="h-4 w-4 shrink-0 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {pending ? (project ? "Saving…" : "Creating…") : (project ? "Save changes" : "Create project")}
        </button>
        <span className={pending ? "pointer-events-none opacity-50" : ""}>
          <Link href={project ? `/projects/${project.id}` : "/projects"} className="btn btn-secondary">
            Cancel
          </Link>
        </span>
      </div>
    </fieldset>
  );
}
