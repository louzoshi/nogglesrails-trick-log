import { NOGGLES_RAILS, type NogglesRailLocation } from "./rails-data";
import type { Sport } from "./sports";
import { SURF_SPOTS, type SurfSpotData } from "./surf-spots";

/** A place to log at: a Noggles Rail (skate) or a surf spot. */
export interface Rail {
  slug: string;
  sport: Sport;
  title: string;
  city: string;
  country: string;
  continent: string;
  type: string;
  lat: number;
  lng: number;
  cover: string;
  /** No site photo yet: `cover` is the 3D render. */
  isRender: boolean;
  photos: string[];
  description: string;
  /** The Gnars proposal that funded it (rails only). */
  proposal?: { name: string; link: string };
}

const isPhoto = (src: string) =>
  !src.includes("youtube.com") && !src.includes("youtu.be") && !src.startsWith("droposal:");

function toRail(r: NogglesRailLocation): Rail {
  const photos = r.images.filter(isPhoto);
  return {
    slug: r.slug,
    sport: "skate",
    title: r.label,
    city: r.city,
    country: r.country,
    continent: r.continent,
    type: r.type,
    lat: r.position[0],
    lng: r.position[1],
    cover: photos[0] ?? "/nogglesRail3D.png",
    isRender: photos.length === 0,
    photos,
    description: r.description,
    proposal: r.proposal,
  };
}

/** Spots have no photo library: the cover is a generated poster. */
function toSpot(s: SurfSpotData): Rail {
  const cover = `/surf/${s.slug}/cover.png`;
  return {
    ...s,
    sport: "surf",
    lat: s.position[0],
    lng: s.position[1],
    cover,
    isRender: false,
    photos: [cover],
  };
}

const RAILS = NOGGLES_RAILS.map(toRail);
const SPOTS = SURF_SPOTS.map(toSpot);
const ALL = [...RAILS, ...SPOTS];

export function getRails(): Rail[] {
  return RAILS;
}

export function getRail(slug: string): Rail | null {
  return RAILS.find((r) => r.slug === slug) ?? null;
}

export function getPlaces(sport: Sport): Rail[] {
  return sport === "surf" ? SPOTS : RAILS;
}

/** Any place by slug — rails and spots share one slug namespace. */
export function getPlace(slug: string): Rail | null {
  return ALL.find((r) => r.slug === slug) ?? null;
}

export function sportOf(slug: string): Sport | null {
  return getPlace(slug)?.sport ?? null;
}
