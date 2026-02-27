"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import { updateTenantSettingsAction } from "./actions";
import { useFormAlert } from "@/components/useFormAlert";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending || disabled}>
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export function SettingsForm({
  initialName,
  initialBusinessInfo,
  initialLogoUrl,
  initialFaviconUrl,
  tenantId,
}: {
  initialName: string;
  initialBusinessInfo: string | null;
  initialLogoUrl: string | null;
  initialFaviconUrl: string | null;
  tenantId: string;
}) {
  const [state, formAction] = useFormState(updateTenantSettingsAction, null);
  useFormAlert(state);

  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const isUploading = logoUploading || faviconUploading;

  const getAuth = async () => {
    const res = await fetch("/api/upload-auth");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Upload auth failed");
    }
    const data = await res.json();
    return {
      signature: data.signature,
      expire: Number(data.expire),
      token: data.token,
      publicKey: data.publicKey,
    };
  };

  const handleLogoUpload = async () => {
    if (!selectedLogoFile) {
      logoInputRef.current?.click();
      return;
    }
    const ext = selectedLogoFile.name.split(".").pop() || "png";
    const fileName = `tenants/${tenantId}/logo-${Date.now()}.${ext}`;
    setLogoUploading(true);
    try {
      const auth = await getAuth();
      const result = await upload({
        file: selectedLogoFile,
        fileName,
        ...auth,
      });
      setLogoUrl(result.url ?? null);
      setSelectedLogoFile(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async () => {
    if (!selectedFaviconFile) {
      faviconInputRef.current?.click();
      return;
    }
    const ext = selectedFaviconFile.name.split(".").pop() || "ico";
    const fileName = `tenants/${tenantId}/favicon-${Date.now()}.${ext}`;
    setFaviconUploading(true);
    try {
      const auth = await getAuth();
      const result = await upload({
        file: selectedFaviconFile,
        fileName,
        ...auth,
      });
      setFaviconUrl(result.url ?? null);
      setSelectedFaviconFile(null);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Favicon upload failed");
    } finally {
      setFaviconUploading(false);
    }
  };

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />
      <input type="hidden" name="faviconUrl" value={faviconUrl ?? ""} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Company / system name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="businessInfo" className="mb-1 block text-sm font-medium text-slate-700">
          Business info (for receipts)
        </label>
        <textarea
          id="businessInfo"
          name="businessInfo"
          rows={4}
          defaultValue={initialBusinessInfo ?? ""}
          className="input w-full"
          placeholder="Address, phone, tax ID, etc."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Logo</label>
        <div className="flex flex-wrap items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-16 w-auto rounded border border-slate-200 object-contain" />
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedLogoFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="btn btn-secondary"
            disabled={isUploading}
          >
            {logoUploading ? "Uploading…" : "Choose file"}
          </button>
          <button
            type="button"
            onClick={handleLogoUpload}
            className="btn btn-primary"
            disabled={isUploading || !selectedLogoFile}
          >
            {logoUploading ? "Uploading…" : "Upload to ImageKit"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Used on receipts and in the app. Upload after choosing a file.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Favicon</label>
        <div className="flex flex-wrap items-center gap-4">
          {faviconUrl && (
            <img src={faviconUrl} alt="Favicon" className="h-8 w-8 rounded object-contain" />
          )}
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/x-icon,image/png,image/svg+xml"
            className="hidden"
            onChange={(e) => setSelectedFaviconFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => faviconInputRef.current?.click()}
            className="btn btn-secondary"
            disabled={isUploading}
          >
            {faviconUploading ? "Uploading…" : "Choose file"}
          </button>
          <button
            type="button"
            onClick={handleFaviconUpload}
            className="btn btn-primary"
            disabled={isUploading || !selectedFaviconFile}
          >
            {faviconUploading ? "Uploading…" : "Upload to ImageKit"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Browser tab icon. PNG, ICO or SVG. Upload after choosing.</p>
      </div>

      <SubmitButton disabled={isUploading} />
    </form>
  );
}
