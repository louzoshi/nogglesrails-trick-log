/**
 * Rail activity → globe effect. Everything that decides how "hot" a rail looks lives here,
 * so the effect can be tuned without touching the globe component.
 */

export type Activity = Record<string, number>;

export interface ActivityRing {
  slug: string;
  lat: number;
  lng: number;
  /** 0..1, relative to the busiest rail. */
  heat: number;
}

/** Log scale: the 1st trick on a quiet rail shows; the 100th on a busy one doesn't drown the rest. */
export function heatOf(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  return Math.log1p(count) / Math.log1p(max);
}

export function activityRings(pins: { slug: string; lat: number; lng: number }[], activity: Activity): ActivityRing[] {
  const max = Math.max(0, ...Object.values(activity));
  return pins
    .map((p) => ({ ...p, heat: heatOf(activity[p.slug] ?? 0, max) }))
    .filter((r) => r.heat > 0);
}

/** react-globe.gl ring accessors. Hotter rails: wider rings, faster pulse. */
export const RING_STYLE = {
  maxRadius: (heat: number) => 3 + heat * 9,
  speed: (heat: number) => 1.5 + heat * 2.5,
  repeatMs: (heat: number) => 1800 - heat * 1100,
  /** `rgb` is the sport's ring color (red rails, blue surf). */
  color:
    (heat: number, [r, g, b]: [number, number, number] = [255, 59, 48]) =>
    (t: number) =>
      `rgba(${r}, ${g}, ${b}, ${(0.55 + heat * 0.45) * (1 - t)})`,
};
