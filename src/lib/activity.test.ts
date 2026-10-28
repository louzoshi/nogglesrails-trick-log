import { describe, expect, it } from "vitest";
import { activityRings, heatOf } from "./activity";

describe("activity", () => {
  it("scales heat logarithmically against the busiest rail", () => {
    expect(heatOf(0, 10)).toBe(0);
    expect(heatOf(10, 10)).toBe(1);
    expect(heatOf(1, 100)).toBeGreaterThan(0.1);
  });

  it("only rings rails that have tricks", () => {
    const pins = [
      { slug: "a", lat: 0, lng: 0 },
      { slug: "b", lat: 1, lng: 1 },
    ];
    expect(activityRings(pins, { a: 3 }).map((r) => r.slug)).toEqual(["a"]);
  });
});
