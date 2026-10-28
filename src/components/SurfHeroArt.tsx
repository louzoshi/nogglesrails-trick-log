"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { COLORWAYS, type Colorway } from "@/lib/colorways";
import { ColorwayPicker } from "./ColorwayPicker";
import { WebGLGuard } from "./WebGLGuard";

const SurfBoard3D = dynamic(() => import("./SurfBoard3D"), {
  ssr: false,
  loading: () => <Board2D />,
});

/**
 * Surf hero illustration: a sunset break with drifting wave layers and a Noggles surfboard.
 * Pure SVG/CSS, no WebGL. Static scene (sky, sun, headland) + animated layers on top.
 */
function waveCrest(y: number, amp: number, len: number) {
  // Two screen widths long so a -50% drift loops seamlessly.
  let d = `M0 ${y}`;
  for (let x = 0; x < 1600; x += len)
    d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
  return d;
}

const LAYERS = [
  { y: 236, amp: 22, len: 200, fill: "#1683c4", foam: 0.45, speed: "16s" },
  { y: 274, amp: 20, len: 160, fill: "#0b6aa6", foam: 0.35, speed: "11s" },
  { y: 318, amp: 16, len: 130, fill: "#0a4a78", foam: 0.25, speed: "7.5s" },
];

/** Sun reflection: shorter streaks further from the horizon. */
const GLINTS = [
  { y: 160, w: 54, d: "0s" },
  { y: 166, w: 40, d: "0.6s" },
  { y: 172, w: 30, d: "1.2s" },
  { y: 178, w: 20, d: "0.3s" },
];

export function SurfHeroArt() {
  const [colorway, setColorway] = useState<Colorway>(COLORWAYS[0]);
  const color = colorway.value;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="surf-art relative aspect-[4/3] w-full overflow-hidden rounded-2xl border shadow-sm">
        {/* Static scene */}
        <svg
          aria-hidden
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0b3557" />
              <stop offset="0.55" stopColor="#1c7fbf" />
              <stop offset="0.85" stopColor="#f6b98a" />
              <stop offset="1" stopColor="#ffd6a5" />
            </linearGradient>
            <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="0.7" stopColor="#ffa94d" />
              <stop offset="1" stopColor="#ff7a3d" />
            </radialGradient>
            <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffd08a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b8fcf" />
              <stop offset="1" stopColor="#1677b6" />
            </linearGradient>
          </defs>
          <rect width="400" height="158" fill="url(#sky)" />
          <circle cx="326" cy="150" r="70" fill="url(#halo)" />
          <circle cx="326" cy="152" r="30" fill="url(#sun)" />
          {/* Headland on the horizon */}
          <path
            d="M0 158 L0 132 C22 120 40 112 58 118 C74 123 86 138 104 150 C112 155 120 157 128 158 Z"
            fill="#0d3a5c"
            opacity="0.85"
          />
          <path
            d="M0 158 L0 143 C18 138 34 140 52 148 C60 152 68 156 76 158 Z"
            fill="#0a2e4a"
          />
          <rect y="158" width="400" height="142" fill="url(#sea)" />
          <line
            x1="0"
            y1="158.5"
            x2="400"
            y2="158.5"
            stroke="#ffe3bf"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          {GLINTS.map((g) => (
            <rect
              key={g.y}
              className="glint"
              x={326 - g.w / 2}
              y={g.y}
              width={g.w}
              height="2"
              rx="1"
              fill="#ffe2a8"
              style={{ animationDelay: g.d }}
            />
          ))}
          {/* Birds */}
          <g
            className="birds"
            fill="none"
            stroke="#0b2a42"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          >
            <path d="M96 62 q5 -5 10 0 q5 -5 10 0" />
            <path d="M122 50 q4 -4 8 0 q4 -4 8 0" />
            <path d="M84 44 q3 -3 6 0 q3 -3 6 0" />
          </g>
        </svg>

        {/* Clouds drift across the sky */}
        <div
          className="cloud absolute left-0 top-[12%] h-5 w-28 rounded-full bg-white/35 blur-[2px]"
          style={{ animationDuration: "48s" }}
        />
        <div
          className="cloud absolute left-0 top-[24%] h-3.5 w-20 rounded-full bg-white/25 blur-[2px]"
          style={{ animationDuration: "64s", animationDelay: "-30s" }}
        />

        {/* Wave layers with foam on the crests */}
        {LAYERS.map((l, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 1600 400"
            preserveAspectRatio="none"
            className="wave-layer absolute bottom-0 left-0 h-full w-[200%]"
            style={{ animationDuration: l.speed }}
          >
            <path
              d={`${waveCrest(l.y, l.amp, l.len)} V400 H0 Z`}
              fill={l.fill}
            />
            <path
              d={waveCrest(l.y, l.amp, l.len)}
              fill="none"
              stroke="#fff"
              strokeOpacity={l.foam}
              strokeWidth="3"
            />
          </svg>
        ))}

        <WebGLGuard fallback={<Board2D />}>
          <div className="absolute inset-0">
            <SurfBoard3D color={color} />
          </div>
        </WebGLGuard>

        <span className="absolute bottom-3 left-4 font-mono text-[11px] uppercase tracking-[0.1em] text-white/75">
          ⌐◨-◨ paddle out
        </span>
      </div>
      <ColorwayPicker value={colorway} onChange={setColorway} />
    </div>
  );
}

/** 2D board: shown while the 3D one loads, and where WebGL isn't available. */
function Board2D() {
  return (
    <>
      {/* Sized in % of the card so the scene keeps its composition on any width. */}
      <div className="absolute left-[40%] top-[58%] w-[44%] -translate-x-1/2 -translate-y-[80%]">
        <svg
          viewBox="0 0 200 96"
          aria-hidden
          className="board h-auto w-full overflow-visible"
        >
          {/* spray off the tail */}
          <g className="spray" fill="#fff">
            <circle cx="10" cy="66" r="2.4" />
            <circle cx="2" cy="58" r="1.6" style={{ animationDelay: "0.4s" }} />
            <circle
              cx="16"
              cy="56"
              r="1.8"
              style={{ animationDelay: "0.8s" }}
            />
            <circle
              cx="-4"
              cy="68"
              r="1.4"
              style={{ animationDelay: "1.1s" }}
            />
          </g>
          {/* fin */}
          <path d="M44 78 l-8 12 l16 -10 Z" fill="#0a0a0a" />
          {/* board: rounded tail, pointed nose */}
          <path
            d="M18 72 C18 64 40 62 100 62 C150 62 176 66 194 72 C176 78 150 82 100 82 C40 82 18 80 18 72 Z"
            fill="#fafafa"
            stroke="#0a0a0a"
            strokeWidth="2.5"
          />
          <path
            d="M24 72 L188 72"
            stroke="#e8312a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* noggles */}
          <g transform="translate(52 33)">
            <rect x="0" y="6" width="14" height="5" fill="#e8312a" />
            <rect x="10" y="0" width="38" height="28" fill="#e8312a" />
            <rect x="16" y="6" width="13" height="16" fill="#fff" />
            <rect x="29" y="6" width="13" height="16" fill="#000" />
            <rect x="48" y="8" width="10" height="5" fill="#e8312a" />
            <rect x="58" y="0" width="38" height="28" fill="#e8312a" />
            <rect x="64" y="6" width="13" height="16" fill="#fff" />
            <rect x="77" y="6" width="13" height="16" fill="#000" />
          </g>
          {/* soft shadow on the water */}
          <ellipse
            cx="104"
            cy="90"
            rx="70"
            ry="4"
            fill="#062a45"
            opacity="0.35"
          />
        </svg>
      </div>
    </>
  );
}
