"use client";

import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Activity } from "@/lib/activity";
import type { Rail } from "@/lib/rails";
import { SPORTS, type Sport } from "@/lib/sports";
import { RailsGlobe } from "./RailsGlobe";

/** Ported from the Gnars homepage rails section; adds trick counts and "hottest rail" ordering. */
const FALLBACK = "/nogglesRail3D.png";
const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function RailGlobeSection({
  rails,
  activity,
  openBounties,
  activityLoaded,
  sport = "skate",
}: {
  sport?: Sport;
  rails: Rail[];
  activity: Activity;
  openBounties: Record<string, number>;
  activityLoaded: boolean;
}) {
  const s = SPORTS[sport];
  const continents = useMemo(() => Array.from(new Set(rails.map((r) => r.continent))), [rails]);
  // Hottest rail first, so the globe opens where the session is.
  const ordered = useMemo(
    () => [...rails].sort((a, b) => (activity[b.slug] ?? 0) - (activity[a.slug] ?? 0)),
    [rails, activity],
  );
  const [slug, setSlug] = useState(ordered[0]?.slug);
  const [filter, setFilter] = useState<string | null>(null);
  const [photoState, setPhotoState] = useState({ slug, i: 0 });

  const active = rails.find((r) => r.slug === slug) ?? ordered[0];
  const frames = active.photos.length ? active.photos : [FALLBACK];
  // A new rail starts at its first photo.
  const photo = photoState.slug === active.slug ? photoState.i % frames.length : 0;
  const setPhoto = (i: number) => setPhotoState({ slug: active.slug, i: (i + frames.length) % frames.length });
  const tricks = activity[active.slug] ?? 0;
  const bounties = openBounties[active.slug] ?? 0;
  const hottest = ordered[0] && (activity[ordered[0].slug] ?? 0) > 0 ? ordered[0].slug : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill active={filter === null} onClick={() => setFilter(null)}>
          All
        </Pill>
        {continents.map((c) => (
          <Pill key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.08fr_1fr]">
        <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0f1114] bg-[radial-gradient(70%_60%_at_50%_45%,rgba(30,58,138,.28),rgba(10,10,10,0)_70%)] lg:min-h-[560px]">
          <RailsGlobe
            rails={rails}
            sport={sport}
            activity={activity}
            focusSlug={active.slug}
            onSelectRail={(r) => setSlug(r.slug)}
            className="h-full min-h-[380px] w-full lg:min-h-[560px]"
          />
          <span className="pointer-events-none absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.08em] text-white/45">
            Drag to spin · tap a {s.place}
          </span>
          <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-white/45">
            <span
              className="size-[7px] rounded-full"
              style={{ background: `rgb(${s.ring})`, boxShadow: `0 0 6px rgb(${s.ring})` }}
            />{" "}
            {s.move} activity
          </span>
          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-white/45">
            <span className="size-[7px] rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" /> selected
          </span>
        </div>

        <div className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.09] bg-[#131316] p-5 sm:p-6">
          <div>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#6699cc]">
              {active.type} · {active.continent}
            </span>
            <h3 className="mt-1.5 text-[clamp(1.75rem,3vw,2.125rem)] font-extrabold leading-[1.05] text-neutral-50">
              {active.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              {active.city}, {active.country}
            </p>
          </div>

          <div className="relative h-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#0d0d10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={frames[photo]}
              src={frames[photo]}
              alt={`${active.title} — ${active.city}`}
              className={active.photos.length ? "size-full object-cover" : "mx-auto h-full max-w-[60%] object-contain"}
              loading="lazy"
            />
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-1 font-mono text-[9.5px] text-white/75">
              {photo + 1} / {frames.length}
            </span>
            {frames.length > 1 && (
              <>
                <CarouselButton side="left" onClick={() => setPhoto(photo - 1)} />
                <CarouselButton side="right" onClick={() => setPhoto(photo + 1)} />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniStat value={activityLoaded ? tricks : "—"} label={`${s.moves} logged`} />
            <MiniStat value={bounties} label="open bounties" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/log?${new URLSearchParams({ sport, rail: active.slug })}`}
              className="rounded-[9px] bg-neutral-50 py-2.5 text-center text-[13px] font-semibold text-neutral-900 hover:opacity-90"
            >
              Log a {s.move} here
            </Link>
            <Link
              href={`${s.placeBase}/${active.slug}`}
              className="rounded-[9px] border border-white/15 py-2.5 text-center text-[13px] font-semibold text-neutral-100 hover:bg-white/[0.06]"
            >
              Open {s.place}
            </Link>
          </div>

          <div className="grid max-h-[240px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {ordered.map((rail) => {
              const dimmed = filter !== null && rail.continent !== filter;
              const count = activity[rail.slug] ?? 0;
              return (
                <button
                  key={rail.slug}
                  type="button"
                  onClick={() => setSlug(rail.slug)}
                  aria-pressed={rail.slug === active.slug}
                  className={cn(
                    "cursor-pointer rounded-lg border px-3 py-2 text-left transition-opacity",
                    rail.slug === active.slug ? "border-white/40 bg-[#262626]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    dimmed && "opacity-45",
                  )}
                >
                  <span className="flex items-center gap-1 truncate text-[13px] font-semibold text-neutral-100">
                    {rail.slug === hottest && <Flame className="size-3.5 shrink-0 text-noggle" />}
                    <span className="truncate">{rail.title}</span>
                  </span>
                  <span className="flex justify-between gap-2 text-[11.5px] text-neutral-400">
                    <span className="truncate">{rail.country}</span>
                    {count > 0 && <span className="shrink-0 font-mono">{count}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="font-mono text-lg font-bold text-neutral-50">{value}</div>
      <div className="text-[10.5px] uppercase tracking-[0.08em] text-neutral-400">{label}</div>
    </div>
  );
}

function CarouselButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80",
        side === "left" ? "left-2.5" : "right-2.5",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
