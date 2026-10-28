import { ImageResponse } from "next/og";
import { NogglesMark } from "@/lib/noggles-image";
import { getPlace, getPlaces } from "@/lib/rails";

export function generateStaticParams() {
  return getPlaces("surf").map((s) => ({ slug: s.slug }));
}

/** Two-color sky/sea palettes; each spot gets one from its slug. */
const PALETTES = [
  ["#0c4a6e", "#0ea5e9", "#f97316"],
  ["#082f49", "#06b6d4", "#facc15"],
  ["#1e1b4b", "#3b82f6", "#fb7185"],
  ["#042f2e", "#14b8a6", "#fde047"],
  ["#172554", "#0284c7", "#fb923c"],
];

/** Side-on shortboard: pointed nose right, rounded tail left, colored rails, stringer, fin, spray. */
function SurfboardArt({ rail }: { rail: string }) {
  return (
    <svg width="440" height="120" viewBox="0 0 440 120">
      <ellipse
        cx="225"
        cy="104"
        rx="170"
        ry="7"
        fill="#021526"
        fillOpacity="0.35"
      />
      <circle cx="18" cy="44" r="6" fill="#fff" fillOpacity="0.9" />
      <circle cx="6" cy="60" r="4" fill="#fff" fillOpacity="0.7" />
      <circle cx="26" cy="26" r="3.5" fill="#fff" fillOpacity="0.6" />
      <path d="M78 74 L60 106 L112 78 Z" fill="#0a0a0a" />
      <path
        d="M34 52 C34 30 84 26 224 26 C324 26 392 36 434 52 C392 68 324 78 224 78 C84 78 34 74 34 52 Z"
        fill={rail}
        stroke="#0a0a0a"
        strokeWidth="5"
      />
      <path
        d="M50 52 C50 38 94 35 224 35 C318 35 376 43 410 52 C376 61 318 69 224 69 C94 69 50 66 50 52 Z"
        fill="#fafafa"
      />
      <path
        d="M46 52 L414 52"
        stroke="#e8312a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M90 38 C150 33 260 32 330 36"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function wave(y: number, amp: number, len: number, shift: number) {
  let d = `M0 ${y}`;
  for (let x = 0; x <= 1200; x += len) {
    d += ` Q${x + len / 4 + shift} ${y - amp} ${x + len / 2 + shift} ${y} T${x + len + shift} ${y}`;
  }
  return `${d} L1200 800 L0 800 Z`;
}

/**
 * Generated poster for a surf spot (spots have no photo library yet). 3:2, safe to crop.
 * `?clip=<n>`: text-free variant used as a demo clip, framed differently per n.
 */
export async function GET(
  req: Request,
  { params }: RouteContext<"/surf/[slug]/cover.png">,
) {
  const { slug } = await params;
  const spot = getPlace(slug);
  if (!spot || spot.sport !== "surf")
    return new Response("Not found", { status: 404 });
  const hash = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const [deep, sea, sun] = PALETTES[hash % PALETTES.length];
  const clip = new URL(req.url).searchParams.get("clip");
  const n = clip === null ? 0 : Number(clip) || 0;
  const shift = (hash + n * 70) % 160;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `linear-gradient(180deg, ${deep} 0%, ${sea} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 440 + ((hash + n * 97) % 250), // sun stays inside the 4:5 clip crop (x 280–920)
          top: 150,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: sun,
          opacity: 0.85,
        }}
      />
      <svg
        width="1200"
        height="800"
        viewBox="0 0 1200 800"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <path d={wave(470, 40, 300, shift)} fill="#ffffff" fillOpacity="0.14" />
        <path d={wave(540, 34, 240, -shift)} fill={deep} fillOpacity="0.55" />
        <path
          d={wave(620, 28, 200, shift / 2)}
          fill={deep}
          fillOpacity="0.85"
        />
      </svg>
      {clip !== null ? (
        // Kept inside the middle 640px: clip cards crop the 3:2 poster to 4:5.
        <div
          style={{
            position: "absolute",
            left: 330 + ((n * 53) % 150),
            top: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `rotate(${[-6, 4, -3, 7][n % 4]}deg)`,
          }}
        >
          <div style={{ display: "flex", marginBottom: -14, marginLeft: 40 }}>
            <NogglesMark u={12} />
          </div>
          <SurfboardArt rail={sun} />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", marginBottom: 28 }}>
            <NogglesMark u={10} />
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -3,
              textShadow: "0 4px 24px rgba(0,0,0,.35)",
            }}
          >
            {spot.title}
          </div>
          <div style={{ fontSize: 40, marginTop: 18, opacity: 0.85 }}>
            {`${spot.city} · ${spot.country}`}
          </div>
          <div
            style={{
              fontSize: 24,
              marginTop: 22,
              padding: "6px 18px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,.5)",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {spot.type}
          </div>
        </div>
      )}
    </div>,
    { width: 1200, height: 800 },
  );
}
