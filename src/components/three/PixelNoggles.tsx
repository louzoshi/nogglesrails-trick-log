"use client";

/** Blocky 3D noggles (⌐◨-◨), built from boxes. `u` = one pixel; 16u wide, 6u tall, facing +z. */
export function PixelNoggles({ u = 0.12, color = "#e8312a" }: { u?: number; color?: string }) {
  const box = (x: number, y: number, w: number, h: number, c: string, d = u, z = 0) => (
    <mesh key={`${x}-${y}-${c}-${z}`} position={[(x + w / 2) * u - 8 * u, (y + h / 2) * u - 3 * u, z]}>
      <boxGeometry args={[w * u, h * u, d]} />
      <meshStandardMaterial color={c} roughness={0.45} />
    </mesh>
  );
  const lens = (x: number) => [
    box(x, 0, 6, 6, color),
    box(x + 1, 1, 2, 4, "#ffffff", u * 1.1),
    box(x + 3, 1, 2, 4, "#0a0a0a", u * 1.1),
  ];
  return (
    <group>
      {box(-3, 3, 3, 1, color)}
      {box(-3, 1, 1, 2, color)}
      {lens(0)}
      {box(6, 3, 1, 1, color)}
      {lens(7)}
    </group>
  );
}
