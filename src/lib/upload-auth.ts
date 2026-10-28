import { z } from "zod";
import { CLIP_MIME_TYPES, MAX_CLIP_BYTES } from "./config";

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(120),
  mimeType: z.enum(CLIP_MIME_TYPES),
  size: z.number().int().positive().max(MAX_CLIP_BYTES),
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  timestamp: z.number().int(),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export const UPLOAD_AUTH_WINDOW_SECONDS = 300;

/** The wallet signs this exact text to get a one-off Pinata upload URL. */
export function uploadMessage(r: UploadRequest) {
  return [
    "Nogglesrails Trick Log — upload clip",
    `file: ${r.filename}`,
    `type: ${r.mimeType}`,
    `size: ${r.size}`,
    `time: ${r.timestamp}`,
  ].join("\n");
}
