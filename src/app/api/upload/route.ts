import { CLIP_MIME_TYPES } from "@/lib/config";
import { publicClient } from "@/lib/rpc";
import { UPLOAD_AUTH_WINDOW_SECONDS, uploadMessage, uploadRequestSchema } from "@/lib/upload-auth";

/**
 * Returns a short-lived Pinata signed upload URL so the clip goes browser → Pinata directly.
 * The caller proves wallet ownership by signing `uploadMessage` (EOA or smart wallet).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { upload?: unknown; signature?: unknown } | null;
  const parsed = uploadRequestSchema.safeParse(body?.upload);
  if (!parsed.success || typeof body?.signature !== "string") {
    return Response.json({ error: "Invalid file type, name or size." }, { status: 400 });
  }
  const upload = parsed.data;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - upload.timestamp) > UPLOAD_AUTH_WINDOW_SECONDS) {
    return Response.json({ error: "Signature expired, try again." }, { status: 401 });
  }
  const valid = await publicClient
    .verifyMessage({
      address: upload.address as `0x${string}`,
      message: uploadMessage(upload),
      signature: body.signature as `0x${string}`,
    })
    .catch(() => false);
  if (!valid) return Response.json({ error: "Invalid signature." }, { status: 401 });

  const jwt = process.env.PINATA_JWT;
  if (!jwt) return Response.json({ error: "Uploads are not configured." }, { status: 503 });

  const res = await fetch("https://uploads.pinata.cloud/v3/files/sign", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      network: "public",
      date: now,
      expires: 120,
      filename: upload.filename,
      max_file_size: upload.size,
      // Pinata checks the type it detects in the file, not the one the browser reported. Safari labels
      // .mov as video/mp4, so allowing only the reported type rejects iPhone clips.
      allow_mime_types: [...CLIP_MIME_TYPES],
      keyvalues: { wallet: upload.address.toLowerCase(), app: "nogglesrails-trick-log" },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => null)) as { data?: unknown } | null;
  if (!res.ok || typeof json?.data !== "string") {
    return Response.json({ error: "Failed to authorize upload." }, { status: 502 });
  }
  return Response.json({ url: json.data }, { headers: { "Cache-Control": "no-store" } });
}
