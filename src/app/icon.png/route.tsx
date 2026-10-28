import { ImageResponse } from "next/og";
import { NogglesMark } from "@/lib/noggles-image";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff3b30",
        }}
      >
        <NogglesMark u={56} color="#0b0b0c" />
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
