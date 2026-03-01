import { getTenantForRequest } from "@/lib/tenant-context";
import { AssetForm } from "../asset-form";

export default async function NewAssetPage() {
  await getTenantForRequest();
  return (
    <div className="space-y-6">
      <h1 className="page-title">Add asset</h1>
      <p className="page-subtitle">Record fixed or current assets for the balance sheet</p>
      <AssetForm />
    </div>
  );
}
