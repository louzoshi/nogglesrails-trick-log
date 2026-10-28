import type { Sport } from "./sports";

/**
 * Bounty tag convention: a PoidhSopa bounty is a rail challenge when its title or description
 * carries `rail:<slug>` (or `rail:any` for every rail), and a surf challenge with `surf:<slug>`
 * (or `surf:any`). `trick:<name>` optionally pins the trick or maneuver.
 * Tricks use dashes for spaces: `trick:bs-50-50`, `trick:frontside-barrel`.
 */
export interface RailTags {
  /** Place slug (rail or spot), or "any". */
  rail: string | null;
  trick: string | null;
  /** Set when a place tag was found. */
  sport?: Sport;
}

const TAG = /(?:^|\s)(rail|surf|trick):([a-z0-9][a-z0-9-]*)/gi;

export function parseTags(text: string): RailTags {
  const tags: RailTags = { rail: null, trick: null };
  for (const [, key, value] of text.matchAll(TAG)) {
    const k = key.toLowerCase();
    if (k === "trick") {
      tags.trick ??= value.toLowerCase();
    } else if (!tags.rail) {
      tags.rail = value.toLowerCase();
      tags.sport = k === "surf" ? "surf" : "skate";
    }
  }
  return tags;
}

/** Description without the machine tags, for display. */
export function stripTags(text: string) {
  return text
    .replace(/(^|\s)(rail|surf|trick|attestation):[^\s]+/gi, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** `any` only covers places of the bounty's own sport. */
export function matchesRail(tags: RailTags, slug: string, sport: Sport = "skate") {
  return tags.rail === slug || (tags.rail === "any" && (tags.sport ?? "skate") === sport);
}

export function trickLabel(slug: string) {
  return slug.replace(/-/g, " ");
}

export function trickSlug(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Claim description: human text first, machine tags last so gnars.com still reads well. */
export function claimDescription(input: {
  rail: string;
  trick: string;
  note: string;
  sport?: Sport;
  attestationUid?: string;
}) {
  const key = input.sport === "surf" ? "surf" : "rail";
  const lines = [input.note.trim(), "", `${key}:${input.rail} trick:${trickSlug(input.trick)}`];
  if (input.attestationUid) lines.push(`attestation:${input.attestationUid}`);
  return lines.join("\n").trim();
}
