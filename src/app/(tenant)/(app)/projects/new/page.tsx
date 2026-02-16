import { getTenantForRequest } from "@/lib/tenant-context";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  await getTenantForRequest();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">New project</h1>
      <ProjectForm />
    </div>
  );
}
