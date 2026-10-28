import { TriangleAlert } from "lucide-react";

export function SourceError({ what }: { what: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <TriangleAlert className="size-4 shrink-0" />
      Couldn&apos;t load {what} right now. Refresh in a bit.
    </p>
  );
}
