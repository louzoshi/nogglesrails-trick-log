import Link from "next/link";
import { GNARS_BOUNTY_URL } from "@/lib/config";
import { DEMO_MODE } from "@/lib/demo";
import type { RailBounty } from "@/lib/sopa";
import { SPORTS } from "@/lib/sports";
import { stripTags, trickLabel } from "@/lib/tags";

export function BountyCard({ bounty, railSlug, railTitle }: { bounty: RailBounty; railSlug?: string; railTitle?: string }) {
  const sport = bounty.tags.sport ?? "skate";
  const rail = railSlug ?? (bounty.tags.rail !== "any" ? bounty.tags.rail : null);
  const logHref = `/log?${new URLSearchParams({
    sport,
    ...(rail ? { rail } : {}),
    bounty: String(bounty.id),
    ...(bounty.tags.trick ? { trick: trickLabel(bounty.tags.trick) } : {}),
  })}`;
  return (
    <article className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap gap-1.5">
        {bounty.voting ? (
          <span className="badge border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">Voting</span>
        ) : (
          <span className="badge badge-open">Open</span>
        )}
        <span className="badge">{bounty.tags.rail === "any" ? `Any ${SPORTS[sport].place}` : (railTitle ?? bounty.tags.rail)}</span>
        {bounty.tags.trick && <span className="badge capitalize">{trickLabel(bounty.tags.trick)}</span>}
      </div>
      <div>
        <h3 className="text-lg font-bold leading-tight">{bounty.title}</h3>
        <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{stripTags(bounty.description)}</p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-bold tabular-nums">{bounty.reward}</div>
          {bounty.claimCount !== undefined && (
            <div className="text-xs text-muted-foreground">
              {bounty.claimCount} {bounty.claimCount === 1 ? "claim" : "claims"}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!DEMO_MODE && (
            <a href={GNARS_BOUNTY_URL(bounty.id)} target="_blank" rel="noreferrer" className="btn btn-outline">
              Details
            </a>
          )}
          {!bounty.voting && (
            <Link href={logHref} className="btn btn-primary">
              Land it
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
