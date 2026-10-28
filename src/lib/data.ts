import type { Activity } from "./activity";
import { DEMO_MODE, getDemoWorld } from "./demo";
import { getTrickLogs, type TrickLog } from "./eas";
import { getPlaces, sportOf } from "./rails";
import { getBountyClaims, getRailBounties, type BountyClaim, type RailBounty } from "./sopa";
import type { Sport } from "./sports";

/** A failed source renders as a failure notice, never as "zero tricks". */
export async function settle<T>(p: Promise<T>): Promise<{ data: T; ok: true } | { data: null; ok: false }> {
  try {
    return { data: await p, ok: true };
  } catch (err) {
    console.error(err);
    return { data: null, ok: false };
  }
}

/** Every page reads through here, so demo mode swaps the sources in one place. */
export async function loadFeeds(): Promise<{
  logs: TrickLog[] | null;
  bounties: RailBounty[] | null;
}> {
  if (DEMO_MODE) {
    const world = await getDemoWorld();
    return { logs: world.logs, bounties: world.bounties };
  }
  const [logs, bounties] = await Promise.all([settle(getTrickLogs()), settle(getRailBounties())]);
  return { logs: logs.data, bounties: bounties.data };
}

export async function loadBounties(): Promise<RailBounty[]> {
  return DEMO_MODE ? (await getDemoWorld()).bounties : getRailBounties();
}

export async function loadClaims(bountyId: number): Promise<BountyClaim[]> {
  return DEMO_MODE ? (await getDemoWorld()).claims.filter((c) => c.bountyId === bountyId) : getBountyClaims(bountyId);
}

/** Logs and bounties of one sport. Logs at unknown places stay with skate (where they came from). */
export function forSport(sport: Sport, logs: TrickLog[] | null, bounties: RailBounty[] | null) {
  return {
    logs: logs?.filter((l) => (sportOf(l.rail) ?? "skate") === sport) ?? null,
    bounties: bounties?.filter((b) => (b.tags.sport ?? "skate") === sport) ?? null,
  };
}

export function activityBySlug(logs: TrickLog[] | null): Activity {
  const out: Activity = {};
  for (const log of logs ?? []) out[log.rail] = (out[log.rail] ?? 0) + 1;
  return out;
}

/** Open bounties per place slug; `any` bounties count for every place of their sport. */
export function openBountiesBySlug(bounties: RailBounty[] | null, sport: Sport = "skate"): Record<string, number> {
  const open = (bounties ?? []).filter((b) => b.open && (b.tags.sport ?? "skate") === sport);
  const any = open.filter((b) => b.tags.rail === "any").length;
  return Object.fromEntries(getPlaces(sport).map((r) => [r.slug, any + open.filter((b) => b.tags.rail === r.slug).length]));
}

const WEEK = 7 * 86400;

/** Skaters ranked by tricks, with how many different rails they've hit. */
export function topSkaters(logs: TrickLog[], since = 0) {
  const by = new Map<string, { address: string; tricks: number; rails: Set<string>; last: number }>();
  for (const l of logs) {
    if (l.time < since) continue;
    const key = l.attester.toLowerCase();
    const row = by.get(key) ?? { address: l.attester, tricks: 0, rails: new Set<string>(), last: 0 };
    row.tricks++;
    row.rails.add(l.rail);
    row.last = Math.max(row.last, l.time);
    by.set(key, row);
  }
  return [...by.values()]
    .map((r) => ({ address: r.address, tricks: r.tricks, rails: r.rails.size, last: r.last }))
    .sort((a, b) => b.tricks - a.tricks || b.rails - a.rails);
}

/** Rails ranked by tricks in the last week. */
export function hotRails(logs: TrickLog[], now: number) {
  const counts = new Map<string, number>();
  for (const l of logs) if (l.time >= now - WEEK) counts.set(l.rail, (counts.get(l.rail) ?? 0) + 1);
  return [...counts.entries()].map(([slug, tricks]) => ({ slug, tricks })).sort((a, b) => b.tricks - a.tricks);
}
