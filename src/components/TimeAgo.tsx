"use client";

import { useSyncExternalStore } from "react";
import { timeAgo } from "@/lib/format";

const noop = () => () => {};

/** Relative time computed in the browser (the server can't read the clock while prerendering). */
export function TimeAgo({ time }: { time: number }) {
  const label = useSyncExternalStore(noop, () => timeAgo(time), () => "");
  return (
    <time dateTime={new Date(time * 1000).toISOString()} suppressHydrationWarning>
      {label}
    </time>
  );
}
