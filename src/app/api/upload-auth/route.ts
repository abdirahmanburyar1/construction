import { getUploadAuthParams } from "@imagekit/next/server";
<<<<<<< HEAD
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  const session = await getUserFromSession();
  if (!session) {
=======
import { getTenantFromSession } from "@/lib/auth";
import { getTenantForRequest } from "@/lib/tenant-context";

export async function GET() {
  const session = await getTenantFromSession();
  const tenant = await getTenantForRequest();
  if (!session || session.tenantId !== tenant.id) {
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
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
