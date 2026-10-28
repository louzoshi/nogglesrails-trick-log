import { Crown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BountyCard } from "@/components/BountyCard";
import { ClipCard } from "@/components/ClipCard";
import { Avatar, SkaterLink } from "@/components/Skater";
import { SourceError } from "@/components/SourceError";
import { EmptyState } from "@/components/ui";
import { mergeClips } from "@/lib/clips";
import { loadClaims, loadFeeds, settle } from "@/lib/data";
import { leaderboard } from "@/lib/eas";
import { getPlace } from "@/lib/rails";
import { SPORTS, type Sport } from "@/lib/sports";
import { matchesRail } from "@/lib/tags";

/** Detail page of a rail or surf spot: photo, challenges, clips, local ranking. */
export async function PlaceDetail({ params, sport }: { params: Promise<{ slug: string }>; sport: Sport }) {
  const { slug } = await params;
  const rail = getPlace(slug);
  if (!rail || rail.sport !== sport) notFound();
  const s = SPORTS[sport];

  const { logs, bounties } = await loadFeeds();
  const railLogs = logs?.filter((l) => l.rail === slug) ?? null;
  const railBounties = bounties?.filter((b) => matchesRail(b.tags, slug, sport)) ?? null;
  const claimResults = await Promise.all((railBounties ?? []).map((b) => settle(loadClaims(b.id))));
  const claims = claimResults
    .flatMap((r) => r.data ?? [])
    // `rail:any` bounties: only claims tagged for this rail belong here.
    .filter((c) => !c.tags.rail || c.tags.rail === slug);
  const clips = railLogs ? mergeClips(railLogs, claims, new Map()) : [];
  const ranking = railLogs ? leaderboard(railLogs) : [];
  const open = railBounties?.filter((b) => b.open) ?? [];
  const lede = rail.description.split("\n\n")[0];
  const logHref = `/log?${new URLSearchParams({ sport, rail: slug })}`;

  return (
    <div className="mt-6 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="badge bg-foreground text-background">{rail.type}</span>
          <span className="badge">{rail.continent}</span>
          {open.length > 0 && <span className="badge badge-open">{open.length} open bounty</span>}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{rail.title}</h1>
        <p className="text-lg text-muted-foreground">
          {rail.city}, {rail.country}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rail.cover}
              alt={rail.title}
              className={`aspect-[16/9] w-full ${rail.isRender ? "bg-muted object-contain p-12" : "object-cover"}`}
            />
            {rail.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {rail.photos.slice(1, 7).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-md object-cover" />
                ))}
              </div>
            )}
            <div className="border-t p-5 sm:p-6">
              <h2 className="mb-2 font-semibold">About this {s.place}</h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{lede}</p>
            </div>
          </div>

          {railBounties === null ? (
            <SourceError what="bounties" />
          ) : (
            open.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Challenges on this {s.place}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {open.map((b) => (
                    <BountyCard key={b.id} bounty={b} railSlug={slug} railTitle={rail.title} />
                  ))}
                </div>
              </section>
            )
          )}

          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Clips</h2>
              {railLogs && <span className="text-sm text-muted-foreground">{clips.length} clips</span>}
            </div>
            {railLogs === null ? (
              <SourceError what="trick logs" />
            ) : clips.length === 0 ? (
              <EmptyState>
                Nobody has logged a {s.move} here yet.{" "}
                <Link className="font-medium text-foreground underline underline-offset-4" href={logHref}>
                  Be the first.
                </Link>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {clips.map((c) => (
                  <ClipCard key={c.key} clip={c} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card flex flex-col gap-3 p-6">
            <h2 className="font-semibold">{sport === "surf" ? "Scored one here?" : "Landed something here?"}</h2>
            <p className="text-sm text-muted-foreground">Share the clip and record it onchain. If there&apos;s a bounty, claim it in the same step.</p>
            <Link href={logHref} className="btn btn-primary w-full">
              Log a {s.move}
            </Link>
          </div>

          <div className="card grid grid-cols-2 divide-x p-0">
            <div className="p-5">
              <div className="font-mono text-2xl font-bold">{railLogs ? railLogs.length : "—"}</div>
              <div className="text-xs text-muted-foreground">{s.moves} logged</div>
            </div>
            <div className="p-5">
              <div className="font-mono text-2xl font-bold">{railLogs ? ranking.length : "—"}</div>
              <div className="text-xs text-muted-foreground">{s.athletes}</div>
            </div>
          </div>

          {ranking.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Crown className="size-4 text-amber-500" /> {sport === "surf" ? "Local legend" : "King of the rail"}
              </h2>
              <ol className="flex flex-col gap-2">
                {ranking.slice(0, 5).map((k, i) => (
                  <li key={k.address} className="flex items-center gap-2.5 text-sm">
                    <span className={`w-4 text-center font-mono text-xs ${i === 0 ? "font-bold text-amber-500" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <Avatar address={k.address} size={24} />
                    <SkaterLink address={k.address} className="min-w-0 flex-1 font-medium" />
                    <span className="font-mono font-semibold tabular-nums">{k.tricks}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="card flex flex-col gap-1 p-6 text-sm">
            <h2 className="mb-2 font-semibold">{sport === "surf" ? "Spot details" : "Rail details"}</h2>
            {sport === "skate" && (
              <a href={`https://www.gnars.com/nogglesrails/${slug}`} target="_blank" rel="noreferrer" className="flex items-center justify-between py-1 hover:underline">
                View on Gnars <ExternalLink className="size-3.5" />
              </a>
            )}
            {rail.proposal && (
              <a href={rail.proposal.link} target="_blank" rel="noreferrer" className="flex items-center justify-between py-1 hover:underline">
                {rail.proposal.name} <ExternalLink className="size-3.5" />
              </a>
            )}
            {sport === "surf" && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${rail.lat},${rail.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-1 hover:underline"
              >
                Open in Maps <ExternalLink className="size-3.5" />
              </a>
            )}
            <span className="pt-1 font-mono text-xs text-muted-foreground">
              {rail.lat.toFixed(3)}, {rail.lng.toFixed(3)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
