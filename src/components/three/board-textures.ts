import * as THREE from "three";
import { inkOn } from "@/lib/colorways";

/** Pixel noggles at (x, y) with pixel size u. 18u wide, 6u tall. */
function noggles(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, frame: string) {
  ctx.fillStyle = frame;
  ctx.fillRect(x, y + 2 * u, 3 * u, u); // temple
  ctx.fillRect(x, y + 3 * u, u, 2 * u);
  ctx.fillRect(x + 3 * u, y, 6 * u, 6 * u);
  ctx.fillRect(x + 9 * u, y + 2 * u, u, u); // bridge
  ctx.fillRect(x + 10 * u, y, 6 * u, 6 * u);
  for (const lx of [x + 4 * u, x + 11 * u]) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(lx, y + u, 2 * u, 4 * u);
    ctx.fillStyle = "#000";
    ctx.fillRect(lx + 2 * u, y + u, 2 * u, 4 * u);
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Popsicle outline (both ends round) as a canvas path; transparent outside = alphaTest cutout. */
function deckPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

export const DECK_TEX = { w: 1024, h: 268 };

/** Griptape: black sandpaper grain with a small noggles cut-out near the nose. */
export function gripTexture() {
  const { w, h } = DECK_TEX;
  const [c, ctx] = canvas(w, h);
  deckPath(ctx, w, h);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.5)";
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  noggles(ctx, w * 0.7, h / 2 - 27, 9, "#e8312a");
  ctx.restore();
  return toTexture(c);
}

/** Bottom graphic: the colorway with a big noggles, maple showing at the ends. */
export function deckGraphicTexture(color: string) {
  const { w, h } = DECK_TEX;
  const [c, ctx] = canvas(w, h);
  deckPath(ctx, w, h);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#e7c89a";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(w * 0.09, 0, w * 0.82, h);
  const ink = inkOn(color);
  noggles(ctx, w / 2 - 8 * 20, h / 2 - 3 * 20 - 18, 20, ink === "#ffffff" ? "#ffffff" : "#e8312a");
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  ctx.font = "700 34px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText("GNARS × NOUNS", w / 2, h - 34);
  ctx.restore();
  return toTexture(c);
}

export const SURF_TEX = { w: 1024, h: 280 };

/** Surfboard deck: white with colorway resin bands along the rails and a red stringer. */
export function surfDeckTexture(color: string) {
  const { w, h } = SURF_TEX;
  const [c, ctx] = canvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, color);
  g.addColorStop(0.16, color);
  g.addColorStop(0.2, "#f7f5f0");
  g.addColorStop(0.8, "#f7f5f0");
  g.addColorStop(0.84, color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#e8312a";
  ctx.fillRect(0, h / 2 - 2, w, 4);
  return toTexture(c);
}

/** Surfboard bottom: the colorway fading to white at the rails, big noggles in the middle. */
export function surfBottomTexture(color: string) {
  const { w, h } = SURF_TEX;
  const [c, ctx] = canvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#f7f5f0");
  g.addColorStop(0.22, color);
  g.addColorStop(0.78, color);
  g.addColorStop(1, "#f7f5f0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  noggles(ctx, w * 0.5 - 18 * 9, h / 2 - 3 * 18, 18, inkOn(color) === "#ffffff" ? "#ffffff" : "#e8312a");
  return toTexture(c);
}
