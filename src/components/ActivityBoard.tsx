import { Crown, Flame, Radio } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { hotRails, topSkaters } from "@/lib/data";
import type { TrickLog } from "@/lib/eas";
import type { Rail } from "@/lib/rails";
import { SPORTS, type Sport } from "@/lib/sports";
import { trickLabel } from "@/lib/tags";
import { BoardFx, CountUp } from "./BoardFx";
import { Avatar, SkaterLink } from "./Skater";
import { TimeAgo } from "./TimeAgo";

const DAY = 86400;
const MONTH = 30 * DAY;
const SPARK_DAYS = 21;
/** Below this many entries the feed sits still: a ticker of three items just looks broken. */
const TICKER_MIN = 8;

/** Logs per day for the last `days` days, oldest first. */
function perDay(logs: TrickLog[], now: number, days: number) {
  const out = Array<number>(days).fill(0);
  for (const l of logs) {
    const ago = Math.floor((now - l.time) / DAY);
    if (ago >= 0 && ago < days) out[days - 1 - ago]++;
  }
  return out;
}

/** Live feed + ranking + hottest places. Trick Log's own view of the session, not a gnars.com page. */
export function ActivityBoard({ logs, rails, sport = "skate" }: { logs: TrickLog[]; rails: Rail[]; sport?: Sport }) {
  const s = SPORTS[sport];
  // Space-separated so it works in `rgb(r g b / alpha)`.
  const rgb = s.ring.join(" ");
  const bySlug = new Map(rails.map((r) => [r.slug, r]));
  // "Now" = newest log: keeps the server render free of clock reads.
  const now = logs[0]?.time ?? 0;
  const feed = logs.slice(0, 16);
  const ticker = feed.length >= TICKER_MIN;
  const kings = topSkaters(logs, now - MONTH).slice(0, 6);
  const hot = hotRails(logs, now).slice(0, 6);
  const maxHot = hot[0]?.tricks ?? 1;
  const days = perDay(logs, now, SPARK_DAYS);
  const maxDay = Math.max(1, ...days);
  const recent = days.reduce((a, b) => a + b, 0);

  const feedItem = (l: TrickLog, key: string, hidden = false) => {
    const rail = bySlug.get(l.rail);
    return (
      <li key={key} aria-hidden={hidden || undefined} inert={hidden} className="flex items-center gap-3 py-[7px]">
        <Avatar address={l.attester} size={32} />
        <div className="min-w-0 flex-1 text-sm leading-tight">
          <div className="flex min-w-0 gap-1">
            <SkaterLink address={l.attester} className="font-medium" />
            <span className="shrink-0 text-muted-foreground">{s.verb}</span>
          </div>
          <div className="truncate text-muted-foreground">
            <span className="font-medium capitalize text-foreground">{trickLabel(l.trick)}</span>
            {rail && (
              <>
                {" "}
                on{" "}
                <Link href={`${s.placeBase}/${rail.slug}`} className="hover:underline">
                  {rail.title}
                </Link>
              </>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          <TimeAgo time={l.time} />
        </span>
      </li>
    );
  };

  return (
    <BoardFx accent={rgb} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
      <Card beam>
        <h3 className="flex items-center gap-2 font-semibold">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: `rgb(${rgb})` }} />
            <span className="relative inline-flex size-2.5 rounded-full" style={{ background: `rgb(${rgb})` }} />
          </span>
          {sport === "surf" ? "Live waves" : "Live landings"}
          <Radio className="ml-auto size-4 text-muted-foreground" />
        </h3>

        {/* Daily activity, last three weeks. */}
        <div className="mt-3 flex items-end gap-3">
          <div className="flex h-9 flex-1 items-end gap-[3px]" aria-label={`${recent} ${s.moves} in the last ${SPARK_DAYS} days`}>
            {days.map((n, i) => (
              <span
                key={i}
                className="grow-y flex-1 rounded-[2px]"
                style={{
                  height: `${Math.max(8, (n / maxDay) * 100)}%`,
                  background: n ? `rgb(${rgb} / ${0.35 + (n / maxDay) * 0.65})` : "var(--muted)",
                  animationDelay: `${i * 25}ms`,
                }}
              />
            ))}
          </div>
          <div className="shrink-0 text-right leading-tight">
            <div className="font-mono text-lg font-bold">
              <CountUp value={recent} />
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">{SPARK_DAYS} days</div>
          </div>
        </div>

        {ticker ? (
          <div className="ticker -mx-1 mt-3 h-[352px] overflow-hidden px-1">
            <ul className="ticker-track" style={{ "--ticker-duration": `${feed.length * 3.2}s` } as React.CSSProperties}>
              {feed.map((l) => feedItem(l, l.uid))}
              {/* Second copy so the loop is seamless; hidden from screen readers. */}
              {feed.map((l) => feedItem(l, `${l.uid}-loop`, true))}
            </ul>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col">{feed.map((l) => feedItem(l, l.uid))}</ul>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Crown className="size-4 text-amber-500" /> Top {s.athletes} · 30 days
        </h3>
        <ol className="flex flex-col gap-3">
          {kings.map((k, i) => (
            <li
              key={k.address}
              className={`flex items-center gap-3 rounded-lg text-sm ${i === 0 ? "-mx-2 bg-amber-500/[0.07] px-2 py-2" : ""}`}
            >
              <span className={`w-4 text-center font-mono text-xs ${i === 0 ? "font-bold text-amber-500" : "text-muted-foreground"}`}>
                {i + 1}
              </span>
              {i === 0 ? (
                <span className="prism-ring">
                  <Avatar address={k.address} size={30} />
                </span>
              ) : (
                <Avatar address={k.address} size={28} />
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <SkaterLink address={k.address} className="block font-medium" />
                <span className="text-xs text-muted-foreground">
                  {k.rails} {k.rails === 1 ? s.place : s.places}
                </span>
              </div>
              <span className="font-mono font-semibold">
                <CountUp value={k.tricks} />
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Flame className="size-4" style={{ color: `rgb(${rgb})` }} /> {sport === "surf" ? "Pumping spots" : "Hot rails"} · this week
        </h3>
        <ol className="flex flex-col gap-3.5">
          {hot.map((h, i) => {
            const rail = bySlug.get(h.slug);
            if (!rail) return null;
            return (
              <li key={h.slug}>
                <Link href={`${s.placeBase}/${rail.slug}`} className="group flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-medium group-hover:underline">{rail.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">
                        <CountUp value={h.tricks} />
                      </span>{" "}
                      {s.moves}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="grow-x shimmer h-full rounded-full"
                      style={
                        {
                          width: `${(h.tricks / maxHot) * 100}%`,
                          background: `linear-gradient(90deg, rgb(${rgb} / .55), rgb(${rgb}))`,
                          animationDelay: `${150 + i * 90}ms`,
                          "--delay": `${i * 0.35}s`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{rail.city}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>
    </BoardFx>
  );
}

function Card({ children, beam = false }: { children: ReactNode; beam?: boolean }) {
  return (
    <div className="card glow-card min-w-0 p-5">
      {beam && <span aria-hidden className="beam" />}
      {children}
    </div>
  );
}
