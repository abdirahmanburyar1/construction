"use client";

import { useFormState } from "react-dom";
import { createProjectAction, updateProjectAction } from "./actions";
import Link from "next/link";

const STATUSES = [
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

  const startStr = project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : "";
  const endStr = project?.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="space-y-6">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input id="name" name="name" required className="input" defaultValue={project?.name} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea id="description" name="description" rows={3} className="input resize-none" defaultValue={project?.description ?? ""} />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input id="location" name="location" className="input" defaultValue={project?.location ?? ""} />
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
        {clients.length > 0 && (
          <div>
            <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-slate-700">Client</label>
            <select id="clientId" name="clientId" className="input" defaultValue={project?.clientId ?? ""}>
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
          <input id="startDate" name="startDate" type="date" required className="input" defaultValue={startStr} />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-slate-700">End date</label>
          <input id="endDate" name="endDate" type="date" className="input" defaultValue={endStr} />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <button type="submit" className="btn btn-primary">{project ? "Save changes" : "Create project"}</button>
        <Link href={project ? `/projects/${project.id}` : "/projects"} className="btn btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
