import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTenantForRequest } from "@/lib/tenant-context";
import { getTenantFromSession } from "@/lib/auth";
import { AppShell } from "../app-shell";
import { ImageKitProvider } from "@imagekit/next";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantForRequest();
  if (tenant.faviconUrl) {
    return { icons: { icon: tenant.faviconUrl } };
  }
  return {};
}

export default async function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantForRequest();
  const session = await getTenantFromSession();
  if (!session || session.tenantId !== tenant.id) {
    redirect("/login");
  }
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";
  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <AppShell userEmail={session.email} tenantName={tenant.name}>
        {children}
      </AppShell>
    </ImageKitProvider>
  );
}
