import { describe, expect, it } from "vitest";
import { claimDescription, matchesRail, parseTags, stripTags, trickSlug } from "./tags";

describe("parseTags", () => {
  it("reads rail and trick tags anywhere in the text", () => {
    expect(parseTags("Best feeble wins!\nrail:rio-de-janeiro trick:feeble")).toEqual({
      rail: "rio-de-janeiro",
      trick: "feeble",
      sport: "skate",
    });
  });

  it("ignores text without tags and words that only contain the key", () => {
    expect(parseTags("guardrail:nope just skate")).toEqual({ rail: null, trick: null });
  });

  it("keeps the first value and lowercases", () => {
    expect(parseTags("RAIL:Sao-Paulo rail:other")).toEqual({ rail: "sao-paulo", trick: null, sport: "skate" });
  });
});

describe("surf tags", () => {
  it("reads surf:<spot> as a surf place", () => {
    expect(parseTags("Biggest barrel\nsurf:saquarema trick:barrel")).toEqual({ rail: "saquarema", trick: "barrel", sport: "surf" });
  });

  it("any only matches places of the same sport", () => {
    const surfAny = parseTags("surf:any");
    expect(matchesRail(surfAny, "saquarema", "surf")).toBe(true);
    expect(matchesRail(surfAny, "rio-de-janeiro", "skate")).toBe(false);
  });

  it("claims round-trip with the surf key", () => {
    const text = claimDescription({ rail: "saquarema", trick: "Frontside Barrel", note: "", sport: "surf" });
    expect(parseTags(text)).toEqual({ rail: "saquarema", trick: "frontside-barrel", sport: "surf" });
    expect(stripTags(`Clean one\n${text}`)).toBe("Clean one");
  });
});

describe("matchesRail", () => {
  it("matches the slug or any", () => {
    expect(matchesRail({ rail: "any", trick: null }, "x")).toBe(true);
    expect(matchesRail({ rail: "x", trick: null }, "x")).toBe(true);
    expect(matchesRail({ rail: "y", trick: null }, "x")).toBe(false);
  });
});

describe("claimDescription", () => {
  it("round-trips through parseTags", () => {
    const text = claimDescription({ rail: "rio-de-janeiro", trick: "BS 50-50", note: "first try" });
    expect(parseTags(text)).toEqual({ rail: "rio-de-janeiro", trick: "bs-50-50", sport: "skate" });
    expect(trickSlug("Switch Crooked Grind")).toBe("switch-crooked-grind");
  });
});

describe("stripTags", () => {
  it("removes machine tags but keeps the text", () => {
    expect(stripTags("Best feeble wins!\nrail:rio-de-janeiro trick:feeble")).toBe("Best feeble wins!");
  });
});
