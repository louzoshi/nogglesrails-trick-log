import { describe, expect, it } from "vitest";
import { getPlaces, sportOf } from "./rails";

describe("places", () => {
  it("rails and surf spots never share a slug (the EAS log stores only the slug)", () => {
    const slugs = [...getPlaces("skate"), ...getPlaces("surf")].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("knows the sport of a slug", () => {
    expect(sportOf("rio-de-janeiro")).toBe("skate");
    expect(sportOf("saquarema")).toBe("surf");
    expect(sportOf("nowhere")).toBeNull();
  });
});
