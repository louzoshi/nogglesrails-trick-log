/** Community colorways of the Noggles Rail (from gnars.com), reused for the 3D boards. */
export const COLORWAYS = [
  { name: "OG Nogglesrail", value: "#FF2D2D" },
  { name: "Dark Gnars", value: "#0B0B0B" },
  { name: "Pink Lil Nouns", value: "#FF6383" },
  { name: "BASED", value: "#0066FF" },
  { name: "DEGEN", value: "#7B2DFF" },
  { name: "HIGHER", value: "#2BFF00" },
  { name: "Yellow Collective", value: "#FFD400" },
  { name: "Storm", value: "#5A5F66" },
  { name: "Gnarly Mud", value: "#5C3A21" },
  { name: "Cloud", value: "#F2F2F0" },
] as const;

export type Colorway = (typeof COLORWAYS)[number];

/** Light colorways need dark ink on top of them. */
export function inkOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 170 ? "#0a0a0a" : "#ffffff";
}
