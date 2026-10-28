import type { ReactNode } from "react";

/** Section heading block from the Gnars homepage: eyebrow + h2 + lead, stats on the right. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-col gap-2.5">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.025em]">{title}</h2>
        {body ? <p className="max-w-[48em] text-pretty text-[15.5px] leading-[1.55] text-muted-foreground">{body}</p> : null}
      </div>
      {aside ? <div className="flex flex-wrap gap-2.5">{aside}</div> : null}
    </div>
  );
}

export function StatTile({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="min-w-[100px] rounded-xl border bg-card px-4 py-3">
      <div className="font-mono text-[22px] font-bold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
    </div>
  );
}

/** Inline stat used in the hero, like the NogglesRails page header. */
export function HeroStat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">{children}</div>;
}
