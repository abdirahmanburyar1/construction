import { getUploadAuthParams } from "@imagekit/next/server";
import { getTenantFromSession } from "@/lib/auth";
import { getTenantForRequest } from "@/lib/tenant-context";

export async function GET() {
  const session = await getTenantFromSession();
  const tenant = await getTenantForRequest();
  if (!session || session.tenantId !== tenant.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return Response.json(
      { error: "ImageKit is not configured" },
      { status: 503 }
    );
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return Response.json({
    token,
    expire,
    signature,
    publicKey,
  });
}
