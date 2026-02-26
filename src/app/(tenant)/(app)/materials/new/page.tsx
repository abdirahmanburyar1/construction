import { getTenantForRequest } from "@/lib/tenant-context";
import { MaterialForm } from "../material-form";

export default async function NewMaterialPage() {
  await getTenantForRequest();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add material to catalog</h1>
      <MaterialForm />
    </div>
  );
}
