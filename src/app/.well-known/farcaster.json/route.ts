import { miniAppManifest } from "@/lib/miniapp";

export function GET() {
  return Response.json(miniAppManifest());
}
