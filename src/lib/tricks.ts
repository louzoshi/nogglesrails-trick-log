/**
 * Rail tricks + the Noggle Dice. Dice mechanics adapted from Skatehive's skate dice
 * (skatehive3.0 lib/utils/skateDiceData.ts, MIT © sktbrd), re-faced for rails.
 */

export const RAIL_TRICKS = [
  "50-50",
  "5-0",
  "Nosegrind",
  "Crooked Grind",
  "Smith Grind",
  "Feeble Grind",
  "Salad Grind",
  "Suski",
  "Boardslide",
  "Lipslide",
  "Noseslide",
  "Tailslide",
  "Bluntslide",
  "Nosebluntslide",
  "Willy Grind",
  "Overcrook",
] as const;

export interface Die {
  key: string;
  faces: string[];
}

export const WILDCARD = "SK8";

export const NOGGLE_DICE: Die[] = [
  { key: "stance", faces: ["Regular", "Switch", "Nollie", "Fakie", "Regular", WILDCARD] },
  { key: "side", faces: ["Frontside", "Backside", "Frontside", "Backside", WILDCARD, WILDCARD] },
  { key: "trick", faces: ["50-50", "Boardslide", "5-0", "Feeble Grind", "Smith Grind", "Crooked Grind"] },
  { key: "out", faces: ["", "", "", "180 Out", "Shuvit Out", "Kickflip Out"] },
];

export function rollDie(die: Die, random = Math.random) {
  return die.faces[Math.floor(random() * die.faces.length)];
}

/** "Regular" is the default stance, so it is dropped from the name. */
export function trickFromFaces(faces: string[]) {
  return faces.filter((f) => f && f !== WILDCARD && f !== "Regular").join(" ");
}

/** Surf maneuvers for the log form's suggestions. */
export const SURF_MOVES = [
  "Bottom Turn",
  "Cutback",
  "Roundhouse Cutback",
  "Snap",
  "Carve",
  "Re-entry",
  "Floater",
  "Layback",
  "Barrel",
  "Frontside Barrel",
  "Backside Barrel",
  "Aerial",
  "Air Reverse",
  "Alley-Oop",
  "Nose Ride",
  "Hang Ten",
] as const;
