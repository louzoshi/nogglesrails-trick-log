import { ArrowRight, Camera, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { ActivityBoard } from "@/components/ActivityBoard";
import { BountyCard } from "@/components/BountyCard";
import { ClipCard } from "@/components/ClipCard";
import { HeroSkateboard } from "@/components/HeroSkateboard";
import { RailCard } from "@/components/RailCard";
import { RailGlobeSection } from "@/components/RailGlobeSection";
import { SportSwitch } from "@/components/SportSwitch";
import { SourceError } from "@/components/SourceError";
import { EmptyState, HeroStat, SectionHeading } from "@/components/ui";
import { mergeClips } from "@/lib/clips";
import { activityBySlug, forSport, loadFeeds, openBountiesBySlug } from "@/lib/data";
import { leaderboard } from "@/lib/eas";
import { getRails } from "@/lib/rails";

const STEPS = [
  { icon: MapPin, title: "Pick a rail", body: "Find the closest Noggles Rail on the globe — Rio, Chicago, Nairobi, London, Rusutsu…" },
  { icon: Camera, title: "Film it, log it", body: "Upload the clip. It's pinned to IPFS and your trick is attested onchain on Base." },
  { icon: Trophy, title: "Claim the bounty", body: "Rail has a Gnars bounty? The same clip becomes your claim. Pool contributors vote." },
];

export default async function Home() {
  const rails = getRails();
  const feeds = await loadFeeds();
  const { logs, bounties } = forSport("skate", feeds.logs, feeds.bounties);
  const titles = new Map(rails.map((r) => [r.slug, r.title]));
  const activity = activityBySlug(logs);
  const openBySlug = openBountiesBySlug(bounties);
  const openBounties = bounties?.filter((b) => b.open) ?? [];
  const latest = logs ? mergeClips(logs, [], titles).slice(0, 8) : [];
  const countries = new Set(rails.map((r) => r.country)).size;

  return (
    <>
      {/* Hero — same rhythm as gnars.com/nogglesrails */}
      <section className="border-b bg-[radial-gradient(60%_80%_at_80%_0%,color-mix(in_oklch,var(--noggle)_8%,transparent),transparent_70%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20">
          <div className="flex flex-col gap-5">
            <SportSwitch sport="skate" href={(s) => (s === "surf" ? "/surf" : "/")} />
            <span className="eyebrow">Gnars × Nouns · Base</span>
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-7xl">
              Land it on a<br />
              Noggles Rail.
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              Community-funded rails, now with a memory. Log every trick onchain and turn your clip into a Gnars bounty
              claim.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <HeroStat value={rails.length} label="Rails" />
              <HeroStat value={countries} label="Countries" />
              <HeroStat value={logs ? logs.length : "—"} label="Tricks logged" />
              <HeroStat value={logs ? leaderboard(logs).length : "—"} label="Skaters" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/log" className="btn btn-primary btn-lg">
                Log a trick <ArrowRight className="size-4" />
              </Link>
              <Link href="#rails" className="btn btn-outline btn-lg">
                Explore rails
              </Link>
            </div>
          </div>
          <HeroSkateboard />
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
        {logs && logs.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Happening now"
              title="The session never stops"
              body="Every landing below is a clip plus an onchain record — who, which rail, which trick, when."
            />
            <ActivityBoard logs={logs} rails={rails} />
          </section>
        )}

        <section id="bounties" className="flex scroll-mt-20 flex-col gap-6">
          <SectionHeading
            eyebrow="Gnars bounties"
            title="Rail challenges"
            body={
              <>
                Any Gnars bounty tagged <code className="rounded bg-muted px-1.5 py-0.5 text-sm">rail:&lt;slug&gt;</code>{" "}
                shows up here. Land it, and your clip goes straight to the bounty as a claim.
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
              No open rail challenges yet. Create a bounty on Gnars with <code>rail:rio-de-janeiro</code> (or{" "}
              <code>rail:any</code>) in the description.
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {openBounties.map((b) => (
                <BountyCard key={b.id} bounty={b} railTitle={b.tags.rail ? titles.get(b.tags.rail) : undefined} />
              ))}
            </div>
          )}
        </section>

        <section id="rails" className="flex scroll-mt-20 flex-col gap-6">
          <SectionHeading
            eyebrow="The rails"
            title={`${rails.length} rails. ${countries} countries. Go skate them.`}
            body="Red waves show where the session is — the more tricks logged on a rail, the louder it pulses."
          />
          {logs === null && <SourceError what="trick activity" />}
          <RailGlobeSection rails={rails} activity={activity} openBounties={openBySlug} activityLoaded={logs !== null} />
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading eyebrow="Fresh clips" title="Latest tricks" />
          {logs === null ? (
            <SourceError what="trick logs" />
          ) : latest.length === 0 ? (
            <EmptyState>
              No tricks logged yet.{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/log">
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
                <s.icon className="size-5 text-noggle" />
                <h3 className="text-lg font-bold">{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">All rails</h2>
            <span className="text-sm text-muted-foreground">{rails.length} locations</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {rails.map((r) => (
              <RailCard key={r.slug} rail={r} tricks={logs ? (activity[r.slug] ?? 0) : null} bounties={openBySlug[r.slug] ?? 0} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
