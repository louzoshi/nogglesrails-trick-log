import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogTrickForm } from "@/components/LogTrickForm";
import { SportSwitch } from "@/components/SportSwitch";
import { SourceError } from "@/components/SourceError";
import { EAS_SCAN_URL } from "@/lib/config";
import { loadBounties, settle } from "@/lib/data";
import { DEMO_MODE } from "@/lib/demo";
import { TRICK_SCHEMA_UID } from "@/lib/eas-schema";
import { getPlaces, sportOf } from "@/lib/rails";
import { isSport, SPORTS, type Sport } from "@/lib/sports";

export const metadata: Metadata = { title: "Log it · Trick Log" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** `?sport=surf`, or the sport of the `?rail=` place; skate by default. */
function sportFrom(q: Record<string, string | string[] | undefined>): Sport {
  const sport = one(q.sport);
  if (isSport(sport)) return sport;
  const rail = one(q.rail);
  return (rail && sportOf(rail)) || "skate";
}

export default function LogPage({ searchParams }: PageProps<"/log">) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Suspense fallback={<div className="h-[760px] animate-pulse rounded-xl bg-muted" />}>
          <LogContent searchParams={searchParams} />
        </Suspense>
      </div>

      <aside className="flex flex-col gap-4 lg:pt-[7.5rem]">
        <div className="card p-6">
          <h2 className="mb-3 font-semibold">What happens</h2>
          <ol className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <b className="text-foreground">1.</b> You sign a message so only real wallets can upload.
            </li>
            <li>
              <b className="text-foreground">2.</b> The clip is pinned to IPFS.
            </li>
            <li>
              <b className="text-foreground">3.</b> It is attested on Base with EAS: rail or spot, trick or wave, clip, note.
            </li>
            <li>
              <b className="text-foreground">4.</b> With a bounty selected, the clip is sent as your claim on Gnars.
            </li>
          </ol>
        </div>
        <div className="card p-6 text-sm">
          <h2 className="mb-1 font-semibold">Costs</h2>
          <p className="text-muted-foreground">Only Base gas — fractions of a cent per log.</p>
          <a
            href={`${EAS_SCAN_URL}/schema/view/${TRICK_SCHEMA_UID}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs underline underline-offset-4"
          >
            View the EAS schema
          </a>
        </div>
      </aside>
    </div>
  );
}

async function LogContent({ searchParams }: { searchParams: PageProps<"/log">["searchParams"] }) {
  const q = await searchParams;
  const sport = sportFrom(q);
  const s = SPORTS[sport];
  const bounties = await settle(loadBounties());
  const bountyParam = Number(one(q.bounty));

  return (
    <>
      <Link href={s.home} className="inline-flex w-fit items-center gap-2 text-sm font-medium hover:underline">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-col gap-4">
        <SportSwitch sport={sport} />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Log a {s.move}</h1>
          <p className="mt-2 text-muted-foreground">
            {sport === "surf" ? "Film it at your spot. Record it forever." : "Film it on a Noggles Rail. Record it forever."}
          </p>
        </div>
      </div>
      {!bounties.ok && <SourceError what={`bounties (you can still log ${s.moves})`} />}
      <LogTrickForm
        key={sport}
        sport={sport}
        rails={getPlaces(sport).map((r) => ({ slug: r.slug, title: r.title, city: r.city, country: r.country, cover: r.cover }))}
        bounties={(bounties.data ?? [])
          .filter((b) => b.open && !b.voting && (b.tags.sport ?? "skate") === sport)
          .map((b) => ({ id: b.id, title: b.title, reward: b.reward, rail: b.tags.rail! }))}
        initialRail={one(q.rail)}
        initialTrick={one(q.trick)}
        initialBounty={Number.isInteger(bountyParam) && one(q.bounty) ? bountyParam : undefined}
        demo={DEMO_MODE}
      />
    </>
  );
}
