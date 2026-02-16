"use client";

import { useFormState } from "react-dom";
import { createProjectAction, updateProjectAction } from "./actions";
import Link from "next/link";
import type { Project } from "@prisma/client";

const STATUSES = ["Planning", "Ongoing", "Completed"];

export function ProjectForm({ project }: { project?: Project }) {
  const [state, formAction] = useFormState(project ? updateProjectAction : createProjectAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input id="name" name="name" required className="input" defaultValue={project?.name} />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={project?.description ?? ""} />
      </div>
      <div>
        <label htmlFor="estimatedBudget" className="mb-1 block text-sm font-medium text-slate-700">
          Estimated budget
        </label>
        <input
          id="estimatedBudget"
          name="estimatedBudget"
          type="number"
          step="0.01"
          min="0"
          className="input"
          defaultValue={project?.estimatedBudget != null ? String(project.estimatedBudget) : ""}
        />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select id="status" name="status" className="input" defaultValue={project?.status ?? "Planning"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {project ? "Save" : "Create"}
        </button>
        <Link href={project ? `/projects/${project.id}` : "/projects"} className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
