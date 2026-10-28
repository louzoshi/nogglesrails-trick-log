import { ArrowRight, Camera, GitPullRequest, Trophy, Waves } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityBoard } from "@/components/ActivityBoard";
import { BountyCard } from "@/components/BountyCard";
import { ClipCard } from "@/components/ClipCard";
import { RailCard } from "@/components/RailCard";
import { RailGlobeSection } from "@/components/RailGlobeSection";
import { SourceError } from "@/components/SourceError";
import { SportSwitch } from "@/components/SportSwitch";
import { SurfHeroArt } from "@/components/SurfHeroArt";
import { EmptyState, HeroStat, SectionHeading } from "@/components/ui";
import { mergeClips } from "@/lib/clips";
import { activityBySlug, forSport, loadFeeds, openBountiesBySlug } from "@/lib/data";
import { leaderboard } from "@/lib/eas";
import { miniAppEmbed } from "@/lib/miniapp";
import { getPlaces } from "@/lib/rails";

export const metadata: Metadata = {
  title: "Surf · Trick Log",
  description: "Log waves onchain at surf spots around the world and claim Gnars surf bounties with the clip.",
  other: { "fc:miniapp": JSON.stringify(miniAppEmbed("/surf")) },
};

const STEPS = [
  { icon: Waves, title: "Pick your spot", body: "Itaúna, Arpoador, Pipeline, Nazaré… find the break on the globe." },
  { icon: Camera, title: "Film it, log it", body: "Upload the wave. It's pinned to IPFS and attested onchain on Base — same record as the rails." },
  { icon: Trophy, title: "Claim the bounty", body: "Spot has a Gnars surf bounty? The same clip becomes your claim. Pool contributors vote." },
];

export default async function SurfHome() {
  const spots = getPlaces("surf");
  const feeds = await loadFeeds();
  const { logs, bounties } = forSport("surf", feeds.logs, feeds.bounties);
  const titles = new Map(spots.map((s) => [s.slug, s.title]));
  const activity = activityBySlug(logs);
  const openBySlug = openBountiesBySlug(bounties, "surf");
  const openBounties = bounties?.filter((b) => b.open) ?? [];
  const latest = logs ? mergeClips(logs, [], titles).slice(0, 8) : [];
  const countries = new Set(spots.map((s) => s.country)).size;

  return (
    <>
      <section className="border-b bg-[radial-gradient(60%_80%_at_80%_0%,rgba(14,165,233,.12),transparent_70%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20">
          <div className="flex flex-col gap-5">
            <SportSwitch sport="surf" href={(s) => (s === "surf" ? "/surf" : "/")} />
            <span className="eyebrow">Gnars × Nouns · Surf · Base</span>
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-7xl">
              Every wave,
              <br />
              <span className="text-sky-500">on the record.</span>
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              Gnars was born on the board — skate <em>and</em> surf. Log the waves you ride onchain and turn the clip into a
              Gnars bounty claim.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <HeroStat value={spots.length} label="Spots" />
              <HeroStat value={countries} label="Countries" />
              <HeroStat value={logs ? logs.length : "—"} label="Waves logged" />
              <HeroStat value={logs ? leaderboard(logs).length : "—"} label="Surfers" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/log?sport=surf" className="btn btn-lg bg-sky-600 text-white hover:bg-sky-700">
                Log a wave <ArrowRight className="size-4" />
              </Link>
              <Link href="#spots" className="btn btn-outline btn-lg">
                Explore spots
              </Link>
            </div>
          </div>
          <SurfHeroArt />
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
        {logs && logs.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="In the water now"
              title="The lineup never empties"
              body="Every wave below is a clip plus an onchain record — who, which spot, which maneuver, when."
            />
            <ActivityBoard logs={logs} rails={spots} sport="surf" />
          </section>
        )}

        <section id="bounties" className="flex scroll-mt-20 flex-col gap-6">
          <SectionHeading
            eyebrow="Gnars bounties"
            title="Surf challenges"
            body={
              <>
                Any Gnars bounty tagged <code className="rounded bg-muted px-1.5 py-0.5 text-sm">surf:&lt;spot&gt;</code>{" "}
                (or <code className="rounded bg-muted px-1.5 py-0.5 text-sm">surf:any</code>) shows up here. Ride it, and your
                clip goes straight to the bounty as a claim.
              </>
            }
            aside={
              <a href="https://www.gnars.com/community/bounties" target="_blank" rel="noreferrer" className="btn btn-outline">
                All Gnars bounties
              </a>
            }
          />
          {bounties === null ? (
            <SourceError what="bounties" />
          ) : openBounties.length === 0 ? (
            <EmptyState>
              No open surf challenges yet. Create a bounty on Gnars with <code>surf:saquarema</code> (or <code>surf:any</code>)
              in the description.
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {openBounties.map((b) => (
                <BountyCard key={b.id} bounty={b} railTitle={b.tags.rail ? titles.get(b.tags.rail) : undefined} />
              ))}
            </div>
          )}
        </section>

        <section id="spots" className="flex scroll-mt-20 flex-col gap-6">
          <SectionHeading
            eyebrow="The spots"
            title={`${spots.length} breaks to start. Yours is next.`}
            body="Blue swells show where the waves are being ridden — the more logs at a spot, the bigger the swell."
          />
          {logs === null && <SourceError what="wave activity" />}
          <RailGlobeSection rails={spots} sport="surf" activity={activity} openBounties={openBySlug} activityLoaded={logs !== null} />
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading eyebrow="Fresh clips" title="Latest waves" />
          {logs === null ? (
            <SourceError what="wave logs" />
          ) : latest.length === 0 ? (
            <EmptyState>
              No waves logged yet.{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/log?sport=surf">
                Be the first.
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {latest.map((c) => (
                <ClipCard key={c.key} clip={c} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card flex flex-col gap-3 p-6">
              <span className="eyebrow">Step {i + 1}</span>
              <div className="flex items-center gap-2.5">
                <s.icon className="size-5 text-sky-500" />
                <h3 className="text-lg font-bold">{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">All spots</h2>
            <span className="text-sm text-muted-foreground">{spots.length} breaks</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {spots.map((s) => (
              <RailCard key={s.slug} rail={s} tricks={logs ? (activity[s.slug] ?? 0) : null} bounties={openBySlug[s.slug] ?? 0} />
            ))}
          </div>
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-6 sm:flex-row sm:items-center">
            <GitPullRequest className="size-5 shrink-0 text-sky-500" />
            <p className="flex-1 text-sm text-muted-foreground">
              <b className="text-foreground">Missing your local break?</b> A spot is one entry in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">src/lib/surf-spots.ts</code> — open a pull request and it shows
              up on the globe, with its own page and bounties.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
