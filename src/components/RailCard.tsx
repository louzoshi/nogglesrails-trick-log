import Link from "next/link";
import type { Rail } from "@/lib/rails";
import { SPORTS } from "@/lib/sports";

/** Same card as gnars.com/nogglesrails, with the rail's trick count in the footer. */
export function RailCard({ rail, tricks, bounties }: { rail: Rail; tricks: number | null; bounties: number }) {
  const s = SPORTS[rail.sport];
  return (
    <Link href={`${s.placeBase}/${rail.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg border transition-colors hover:border-foreground/20">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted bg-[radial-gradient(60%_60%_at_50%_40%,color-mix(in_oklch,var(--noggle)_14%,transparent),transparent_70%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rail.cover}
            alt={`${rail.title} — ${rail.city}, ${rail.country}`}
            loading="lazy"
            className={`absolute inset-0 size-full transition-transform duration-300 group-hover:scale-105 ${rail.isRender ? "m-auto max-h-[55%] max-w-[55%] object-contain" : "object-cover"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-sm font-semibold text-white">{rail.title}</p>
            <p className="text-xs text-white/70">
              {rail.city}, {rail.country}
            </p>
          </div>
          {bounties > 0 && <span className="badge badge-open absolute right-2 top-2 bg-background/90">{bounties} bounty</span>}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-muted-foreground">{rail.continent}</span>
          <span className="badge badge-secondary text-[10px]">{tricks === null ? "—" : `${tricks} ${s.moves}`}</span>
        </div>
      </div>
    </Link>
  );
}
