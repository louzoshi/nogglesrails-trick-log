"use client";

import type { Address } from "viem";
import { uploadMessage, type UploadRequest } from "./upload-auth";

export interface UploadedClip {
  cid: string;
}

/** Signs the upload request, gets a signed Pinata URL and sends the file with progress. */
export async function uploadClip(
  file: File,
  address: Address,
  signMessage: (message: string) => Promise<`0x${string}`>,
  onProgress: (pct: number) => void,
): Promise<UploadedClip> {
  const upload: UploadRequest = {
    filename: file.name.slice(-120) || "clip.mp4",
    mimeType: file.type as UploadRequest["mimeType"],
    size: file.size,
    address,
    timestamp: Math.floor(Date.now() / 1000),
  };
  const signature = await signMessage(uploadMessage(upload));
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload, signature }),
  });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Could not start the upload.");

  const form = new FormData();
  form.append("file", file);
  form.append("network", "public");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      try {
        const body = JSON.parse(xhr.responseText) as { data?: { cid?: string } };
        if (xhr.status >= 200 && xhr.status < 300 && body.data?.cid) resolve({ cid: body.data.cid });
        else reject(new Error(`Upload failed (${xhr.status}).`));
      } catch {
        reject(new Error("Upload failed: unreadable response."));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed: network error.")));
    xhr.open("POST", json.url!);
    xhr.send(form);
  });
}
