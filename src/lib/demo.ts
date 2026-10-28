import { cacheLife } from "next/cache";
import type { Address, Hex } from "viem";
import type { TrickLog } from "./eas";
import { getPlaces } from "./rails";
import type { BountyClaim, RailBounty } from "./sopa";
import type { Sport } from "./sports";
import { claimDescription, parseTags, trickSlug } from "./tags";

/**
 * Demo mode: sample skaters, logs, bounties and claims so the app can be shown before
 * anyone has logged a trick. Turned on with NEXT_PUBLIC_DEMO_MODE=1 — the UI then shows a
 * "sample data" banner and the log form simulates instead of sending transactions.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const DEMO_SKATERS: { address: Address; name: string }[] = [
  ["0x7a3f1c9e2b4d5a6f8e0c1b2a3d4e5f6a7b8c9d01", "railbomber"],
  ["0x1b9e4f2a7c3d8e5b6a0f9c1d2e3b4a5c6d7e8f02", "noggle_ninja"],
  ["0x2c8d5e3b9a4f1c6d7e0b8a9f1c2d3e4f5a6b7c03", "xv.local"],
  ["0x3d7e6f4c0b5a2d9e8f1c7b0a2d3c4e5f6a7b8d04", "feeblequeen"],
  ["0x4e6f7a5d1c6b3e0f9a2d8c1b3e4d5f6a7b8c9e05", "chi.slappy"],
  ["0x5f5a8b6e2d7c4f1a0b3e9d2c4f5e6a7b8c9d0f06", "medallo.sk8"],
  ["0x6a4b9c7f3e8d5a2b1c4f0e3d5a6f7b8c9d0e1a07", "iapi.crew"],
  ["0x7b3cad8a4f9e6b3c2d5a1f4e6b7a8c9d0e1f2b08", "london.lines"],
  ["0x8c2dbe9b5a0f7c4d3e6b2a5f7c8b9d0e1f2a3c09", "kibera.rolls"],
  ["0x9d1ecfac6b1a8d5e4f7c3b6a8d9c0e1f2a3b4d10", "smithgrind.eth"],
  ["0xae0fd0bd7c2b9e6f5a8d4c7b9eadf1f2a3b4c5e11", "porto.pivot"],
  ["0xbf1ae1ce8d3cafa7b9e5d8cafb0e2a3b4c5d6f12", "nounish.ollie"],
  ["0xc02bf2df9e4dbab8cafe9dbc0f1a3b4c5d6e7a13", "manhuacu.mike"],
  ["0xd13c03e0af5ecbc9dbaf0edcd1a2b4c5d6e7f814", "boardslide.bia"],
].map(([address, name]) => ({ address: address as Address, name }));

/** Surfers; a few skaters (railbomber, xv.local) surf too. */
export const DEMO_SURFERS: { address: Address; name: string }[] = [
  ["0xe24d14f1b06fdcdaecb01fede2b3c5d6e7f8a915", "itauna.ana"],
  ["0xf35e25a2c17aedebfdc12afef3c4d6e7f8a9b016", "tubetime"],
  ["0x046f36b3d28bfefcaed23baf04d5e7f8a9b0c117", "floripa.foam"],
  ["0x15704ac4e39cafadbfe34cba15e6f8a9b0c1d218", "noggle.longboard"],
  ["0x26815bd5f4adbabecaf45dcb26f7a9b0c1d2e319", "arpoa.dor"],
  ["0x37926ce605bebcbfdba56edc37a8b0c1d2e3f420", "frontside.fer"],
  ["0x48a37df716cfcdcaecb67fed48b9c1d2e3f4a521", "ericeira.rui"],
  ["0x59b48ea827dadedbfdc78afe59cad2e3f4a5b622", "bali.barrels"],
].map(([address, name]) => ({ address: address as Address, name }));

const NAMES = new Map([...DEMO_SKATERS, ...DEMO_SURFERS].map((s) => [s.address.toLowerCase(), s.name]));
export function demoName(address: string) {
  return DEMO_MODE ? NAMES.get(address.toLowerCase()) : undefined;
}

interface DemoSport {
  sport: Sport;
  count: number;
  seed: number;
  crew: { address: Address; name: string }[];
  /** How busy each place is in the demo (relative weight). */
  weight: Record<string, number>;
  /** Place where a bounty is running, so its trick shows up more there. */
  hot: { slug: string; trick: string };
  stances: string[];
  tricks: string[];
  outs: string[];
  notes: string[];
}

const SKATE: DemoSport = {
  sport: "skate",
  count: 72,
  seed: 42,
  crew: DEMO_SKATERS,
  // Rio is the home of the OG rail.
  weight: {
    "rio-de-janeiro": 18,
    "porto-alegre": 9,
    chicago: 8,
    medellin: 7,
    "rio-de-janeiro-delta": 6,
    london: 5,
    nairobi: 4,
    "buenos-aires": 4,
    "sao-paulo-sopa-de-letras": 3,
    silverado: 3,
    "minas-gerais": 2,
    milan: 2,
    "republica-dominicana": 1,
  },
  hot: { slug: "rio-de-janeiro", trick: "Feeble Grind" },
  stances: ["", "", "", "Backside ", "Frontside ", "Switch ", "Nollie ", "Fakie "],
  tricks: ["50-50", "5-0", "Boardslide", "Feeble Grind", "Smith Grind", "Crooked Grind", "Lipslide", "Nosegrind", "Tailslide", "Noseslide", "Salad Grind", "Bluntslide"],
  outs: ["", "", "", "", " 180 Out", " Shuvit Out", " Kickflip Out"],
  notes: ["", "", "", "first try!", "third session on it", "rain all week, finally dry", "for the dice challenge", "sunset session", "landed it for the crew", "took 40 tries", "", "cash for tricks day"],
};

const SURF: DemoSport = {
  sport: "surf",
  count: 46,
  seed: 7,
  crew: [...DEMO_SURFERS, DEMO_SKATERS[0], DEMO_SKATERS[2]],
  weight: {
    saquarema: 12,
    arpoador: 10,
    joaquina: 8,
    itacare: 5,
    ericeira: 4,
    "puerto-escondido": 4,
    uluwatu: 3,
    pipeline: 3,
    malibu: 3,
    hossegor: 2,
    "jeffreys-bay": 2,
    "bells-beach": 1,
  },
  hot: { slug: "saquarema", trick: "Barrel" },
  stances: ["", "", "Frontside ", "Backside "],
  tricks: ["Bottom Turn", "Cutback", "Roundhouse Cutback", "Snap", "Floater", "Barrel", "Air Reverse", "Aerial", "Carve", "Re-entry", "Layback"],
  outs: [""],
  notes: ["", "", "", "dawn patrol", "glassy morning", "offshore all day", "head-high sets", "crowded but scored one", "wave of the day", "", "paddled out in noggles"],
};

/** Small deterministic PRNG so every render shows the same demo world. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function fakeHex(r: () => number, bytes: number): Hex {
  let out = "0x";
  for (let i = 0; i < bytes; i++) out += Math.floor(r() * 256).toString(16).padStart(2, "0");
  return out as Hex;
}

function demoLogs(d: DemoSport, now: number): TrickLog[] {
  const r = rng(d.seed);
  const photos = new Map(getPlaces(d.sport).map((p) => [p.slug, p.photos]));
  const weighted = Object.entries(d.weight).flatMap(([slug, w]) => Array(w).fill(slug) as string[]);
  // Each place has a few locals who hit it most.
  const localsOf = (slug: string) => {
    const start = Math.abs([...slug].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) % d.crew.length;
    return [0, 1, 2].map((i) => d.crew[(start + i * 5) % d.crew.length]);
  };
  const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)];

  const logs: TrickLog[] = [];
  for (let i = 0; i < d.count; i++) {
    const place = pick(weighted);
    const athlete = r() < 0.75 ? pick(localsOf(place)) : pick(d.crew);
    const pics = photos.get(place) ?? [];
    // Skewed to recent: more sessions in the last few days.
    const age = Math.floor(Math.pow(r(), 1.8) * 21 * 86400) + 600;
    // The place with a running bounty sees its trick far more often.
    const move = place === d.hot.slug && r() < 0.4 ? d.hot.trick : pick(d.tricks);
    logs.push({
      uid: fakeHex(r, 32),
      attester: athlete.address,
      time: now - age,
      rail: place,
      trick: `${pick(d.stances)}${move}${pick(d.outs)}`,
      // Surf spots only have a generated poster: clips use its text-free variant.
      clip: d.sport === "surf" ? `${pics[0]}?clip=${i % 4}` : pics.length ? pics[i % pics.length] : "/nogglesRail3D.png",
      note: pick(d.notes),
    });
  }
  return logs;
}

export interface DemoWorld {
  logs: TrickLog[];
  bounties: RailBounty[];
  claims: BountyClaim[];
}

const ISSUER = "0xa60f2b9c4d1e8a7b6c5d4e3f2a1b0c9d8e7f6d68" as Address;
const BOUNTIES = [
  { id: 101, title: "Best feeble on the OG rail", description: "Cleanest feeble grind on Praça XV this month takes the pot. Film it from the stairs.\nrail:rio-de-janeiro trick:feeble-grind", reward: "50 USDC", age: 9 },
  { id: 102, title: "Noggle Dice challenge", description: "Roll the Noggle Dice in the app and land whatever comes out — any Noggles Rail counts.\nrail:any", reward: "25 USDC", age: 5 },
  { id: 103, title: "First trick in Japan", description: "Nobody has logged the Rusutsu rail yet. Be the first one on the board.\nrail:rusutsu", reward: "0.01 ETH", age: 3 },
  { id: 104, title: "Chicago winter session", description: "Before the snow shuts it down: best line through the Chicago rail.\nrail:chicago", reward: "30 USDC", age: 16, voting: true },
  { id: 201, title: "Barrel of the month at Itaúna", description: "Deepest barrel at Saquarema this month. Film from the beach, show the exit.\nsurf:saquarema trick:barrel", reward: "40 USDC", age: 11 },
  { id: 202, title: "Noggles in the lineup", description: "Paddle out wearing Noggles, ride one, log it. Any spot in the world.\nsurf:any", reward: "20 USDC", age: 6 },
  { id: 203, title: "First wave at Nazaré", description: "Nobody has logged Praia do Norte yet. Safety first — tow partners welcome.\nsurf:nazare", reward: "0.02 ETH", age: 2 },
];

export async function getDemoWorld(): Promise<DemoWorld> {
  "use cache";
  cacheLife("hours");
  const now = Math.floor(Date.now() / 1000);
  const logs = [...demoLogs(SKATE, now), ...demoLogs(SURF, now)].sort((a, b) => b.time - a.time);
  const sportOfLog = new Map<string, Sport>([
    ...getPlaces("skate").map((p) => [p.slug, "skate"] as const),
    ...getPlaces("surf").map((p) => [p.slug, "surf"] as const),
  ]);

  const bounties: RailBounty[] = BOUNTIES.map((b) => ({
    id: b.id,
    issuer: ISSUER,
    title: b.title,
    description: b.description,
    reward: b.reward,
    createdAt: now - b.age * 86400,
    open: true,
    tags: parseTags(b.description),
    // The oldest skate challenge has closed submissions and is in the contributors' vote.
    voting: b.voting ?? false,
  }));

  // Logs that went to a bounty: matching place (or any place of the sport), after the bounty opened.
  const claims: BountyClaim[] = [];
  let claimId = 900;
  for (const b of bounties) {
    const sport = b.tags.sport ?? "skate";
    const candidates = logs.filter(
      (l) =>
        (b.tags.rail === "any" ? sportOfLog.get(l.rail) === sport : l.rail === b.tags.rail) &&
        l.time > b.createdAt &&
        (!b.tags.trick || trickSlug(l.trick).includes(b.tags.trick)),
    );
    for (const l of candidates.slice(0, b.tags.rail === "any" ? 6 : 5)) {
      claims.push({
        id: claimId++,
        bountyId: b.id,
        issuer: l.attester,
        name: `${l.trick} @ ${l.rail}`,
        description: claimDescription({ rail: l.rail, trick: l.trick, note: l.note || l.trick, sport, attestationUid: l.uid }),
        createdAt: l.time,
        accepted: false,
        uri: l.clip,
        tags: { rail: l.rail, trick: null, sport },
      });
    }
    b.claimCount = claims.filter((c) => c.bountyId === b.id).length;
  }
  return { logs, bounties, claims };
}
