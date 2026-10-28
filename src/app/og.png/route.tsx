import { ImageResponse } from "next/og";
import { NogglesMark } from "@/lib/noggles-image";

/** 3:2 cast embed / mini app hero image. */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0b0b0c",
          color: "#f4f4f5",
        }}
      >
        <div style={{ display: "flex", marginBottom: 40 }}>
          <NogglesMark u={18} />
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1 }}>Land it on a</div>
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1, color: "#ff3b30" }}>Noggles Rail.</div>
        <div style={{ fontSize: 36, marginTop: 32, color: "#a1a1aa" }}>Trick Log · Gnars × Nouns · Base</div>
      </div>
    ),
    { width: 1200, height: 800 },
  );
}
