/** Noggles drawn with boxes for `ImageResponse` (its default font has no ⌐◨-◨ glyphs). `u` = one pixel. */
export function NogglesMark({ u, color = "#ff3b30" }: { u: number; color?: string }) {
  const lens = (
    <div style={{ display: "flex", width: 6 * u, height: 6 * u, border: `${u}px solid ${color}` }}>
      <div style={{ width: 2 * u, height: 4 * u, background: "#fff" }} />
      <div style={{ width: 2 * u, height: 4 * u, background: "#000" }} />
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 2 * u }}>
        <div style={{ width: 3 * u, height: u, background: color }} />
        <div style={{ width: u, height: 2 * u, background: color }} />
      </div>
      {lens}
      <div style={{ width: u, height: u, marginTop: 2 * u, background: color }} />
      {lens}
    </div>
  );
}
