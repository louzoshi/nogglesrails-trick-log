/**
 * Gnars is skate *and* surf. Both share the same onchain pieces (one EAS schema, PoidhSopa
 * bounties); a sport only changes where you log (rails vs spots), the words and the colors.
 * Adding a sport = one entry here + its places in `places.ts`.
 */
export type Sport = "skate" | "surf";

export interface SportCopy {
  /** Bounty tag key: `rail:<slug>` / `surf:<slug>`. */
  tag: string;
  /** Home of the sport and base path of its places. */
  home: string;
  placeBase: string;
  place: string;
  places: string;
  athlete: string;
  athletes: string;
  move: string;
  moves: string;
  /** "landed a feeble", "rode a barrel". */
  verb: string;
  movePlaceholder: string;
  /** Globe marker icon and ring color (r, g, b). */
  marker: string;
  ring: [number, number, number];
}

export const SPORTS: Record<Sport, SportCopy> = {
  skate: {
    tag: "rail",
    home: "/",
    placeBase: "/rail",
    place: "rail",
    places: "rails",
    athlete: "skater",
    athletes: "skaters",
    move: "trick",
    moves: "tricks",
    verb: "landed",
    movePlaceholder: "e.g. Backside Feeble Grind",
    marker: "/nogglesRail3D.png",
    ring: [255, 59, 48],
  },
  surf: {
    tag: "surf",
    home: "/surf",
    placeBase: "/surf",
    place: "spot",
    places: "spots",
    athlete: "surfer",
    athletes: "surfers",
    move: "wave",
    moves: "waves",
    verb: "rode",
    movePlaceholder: "e.g. Frontside Barrel",
    marker: "/surf-pin.svg",
    ring: [56, 189, 248],
  },
};

export function isSport(value: unknown): value is Sport {
  return value === "skate" || value === "surf";
}
