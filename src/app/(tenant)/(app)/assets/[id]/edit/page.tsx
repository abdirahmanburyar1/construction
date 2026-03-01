import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantForRequest } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";
import { AssetForm } from "../../asset-form";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tenant = await getTenantForRequest();
  const { id } = await params;
  const asset = await prisma.asset.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!asset) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Edit asset</h1>
        <Link href="/assets" className="btn btn-secondary">
          ← Back to assets
        </Link>
      </div>
      <AssetForm asset={asset} />
    </div>
  );
}
