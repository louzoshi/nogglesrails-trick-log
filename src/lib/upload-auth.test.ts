import { describe, expect, it } from "vitest";
import { clipMimeType } from "./upload-auth";

describe("clipMimeType", () => {
  it("keeps a known type the browser reported", () => {
    expect(clipMimeType({ name: "IMG_0001.MOV", type: "video/quicktime" })).toBe("video/quicktime");
    expect(clipMimeType({ name: "IMG_0001.MOV", type: "video/mp4" })).toBe("video/mp4");
  });

  it("falls back to the extension when the type is missing or unknown", () => {
    expect(clipMimeType({ name: "IMG_0001.MOV", type: "" })).toBe("video/quicktime");
    expect(clipMimeType({ name: "clip.m4v", type: "video/x-m4v" })).toBe("video/mp4");
    expect(clipMimeType({ name: "clip.webm", type: "" })).toBe("video/webm");
  });

  it("rejects anything that is not a supported clip", () => {
    expect(clipMimeType({ name: "photo.jpg", type: "image/jpeg" })).toBeNull();
    expect(clipMimeType({ name: "noextension", type: "" })).toBeNull();
  });
});
