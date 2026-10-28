import { ExternalLink, Trophy } from "lucide-react";
import { EAS_SCAN_URL, GNARS_BOUNTY_URL } from "@/lib/config";
import { DEMO_MODE } from "@/lib/demo";
import { toGatewayUrl } from "@/lib/ipfs";
import { trickLabel } from "@/lib/tags";
import { Avatar, SkaterLink } from "./Skater";
import { TimeAgo } from "./TimeAgo";

export interface Clip {
  key: string;
  trick: string;
  clip: string;
  skater: string;
  time: number;
  note?: string;
  railTitle?: string;
  attestationUid?: string;
  bounty?: { id: number; accepted: boolean };
}

const IMAGE = /\.(jpe?g|png|gif|webp|avif)(\?|$)|images\.hive\.blog|^\//i;

export function ClipCard({ clip }: { clip: Clip }) {
  const src = toGatewayUrl(clip.clip);
  return (
    <article className="group overflow-hidden rounded-lg border bg-card">
      <div className="relative bg-black">
        {/* Demo clips are the rails' own photos and GIFs. */}
        {DEMO_MODE || IMAGE.test(src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={clip.trick} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        ) : (
          <video src={src} controls playsInline preload="metadata" className="aspect-[4/5] w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10">
          <h3 className="text-sm font-semibold capitalize leading-tight text-white">{trickLabel(clip.trick)}</h3>
          {clip.railTitle && <p className="text-xs text-white/70">{clip.railTitle}</p>}
        </div>
        {clip.bounty && (
          <a
            href={DEMO_MODE ? undefined : GNARS_BOUNTY_URL(clip.bounty.id)}
            target="_blank"
            rel="noreferrer"
            className={`badge absolute left-2 top-2 bg-background/90 ${clip.bounty.accepted ? "badge-open" : ""}`}
          >
            {clip.bounty.accepted ? <Trophy className="mr-1 size-3" /> : null}
            {clip.bounty.accepted ? "Paid" : "Bounty claim"}
          </a>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-center gap-2 text-xs">
          <Avatar address={clip.skater} size={20} />
          <SkaterLink address={clip.skater} className="font-medium" />
        </div>
        {clip.note && <p className="line-clamp-2 text-xs text-muted-foreground">“{clip.note}”</p>}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <TimeAgo time={clip.time} />
          {clip.attestationUid && !DEMO_MODE && (
            <a
              href={`${EAS_SCAN_URL}/attestation/view/${clip.attestationUid}`}
              target="_blank"
              rel="noreferrer"
              title="View onchain"
              className="flex items-center gap-1 hover:text-foreground"
            >
              onchain <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
