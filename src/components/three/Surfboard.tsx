"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { surfBottomTexture, surfDeckTexture } from "./board-textures";
import { PixelNoggles } from "./PixelNoggles";

/** Procedural shortboard, x = length (nose at +x), y = up. */
const L = 10;
const W_MAX = 2.7;
const NT = 140;
const NS = 28;

const uOf = (t: number) => 0.1 + 0.9 * t;
/** Half width: squash tail, wide point a bit behind center, pointed nose. */
const halfWidth = (t: number) => (W_MAX / 2) * Math.pow(Math.sin(Math.PI * uOf(t)), 0.75);
const thickness = (t: number) => 0.38 * Math.pow(Math.sin(Math.PI * uOf(t)), 0.55);
/** Rocker: strong at the nose, a little in the tail. */
const rocker = (t: number) => 0.95 * Math.pow(t, 3.5) + 0.2 * Math.pow(1 - t, 3);

function surface(top: boolean) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NT; i++) {
    const t = i / NT;
    const hw = halfWidth(t);
    const th = thickness(t);
    for (let j = 0; j <= NS; j++) {
      const s = -1 + (2 * j) / NS;
      const z = s * hw;
      // Rounded deck, flatter bottom; both meet at the rail (s = ±1).
      const round = Math.pow(Math.max(0, 1 - s * s), top ? 0.45 : 0.25);
      const y = rocker(t) + (top ? th * 0.62 : -th * 0.38) * round;
      pos.push(-L / 2 + t * L, y, z);
      uv.push(t, 0.5 + z / W_MAX);
    }
  }
  const row = NS + 1;
  for (let i = 0; i < NT; i++) {
    for (let j = 0; j < NS; j++) {
      const a = i * row + j;
      const b = a + row;
      if (top) idx.push(a, a + 1, b, b, a + 1, b + 1);
      else idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function finGeometry(size: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.62 * size, 0);
  s.quadraticCurveTo(0.25 * size, -0.2 * size, -0.12 * size, -0.62 * size);
  s.quadraticCurveTo(-0.02 * size, -0.25 * size, 0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: false });
  geo.translate(0, 0, -0.0175);
  return geo;
}

/** Bottom height at (t, rail fraction s). */
function bottomY(t: number, s: number) {
  return rocker(t) - thickness(t) * 0.38 * Math.pow(Math.max(0, 1 - s * s), 0.25);
}

export function Surfboard({ color }: { color: string }) {
  const top = useMemo(() => surface(true), []);
  const bottom = useMemo(() => surface(false), []);
  const deck = useMemo(() => surfDeckTexture(color), [color]);
  const graphic = useMemo(() => surfBottomTexture(color), [color]);
  useEffect(
    () => () => {
      deck.dispose();
      graphic.dispose();
    },
    [deck, graphic],
  );
  const centerFin = useMemo(() => finGeometry(1), []);
  const sideFin = useMemo(() => finGeometry(0.9), []);

  // Thruster: one center fin near the tail, two side fins a bit forward, toed in.
  const fins = useMemo(() => {
    const at = (t: number, s: number) => {
      const z = s * halfWidth(t);
      return [-L / 2 + t * L, bottomY(t, s) + 0.01, z] as const;
    };
    return [
      { pos: at(0.04, 0), geo: centerFin, rot: [0, 0, 0] as const },
      { pos: at(0.11, 0.72), geo: sideFin, rot: [-0.12, 0.05, 0] as const },
      { pos: at(0.11, -0.72), geo: sideFin, rot: [0.12, -0.05, 0] as const },
    ];
  }, [centerFin, sideFin]);

  return (
    <group>
      <mesh geometry={top}>
        <meshPhysicalMaterial map={deck} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={bottom}>
        <meshPhysicalMaterial map={graphic} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Noggles riding on the deck, like the 2D board. */}
      <group position={[0.4, rocker(0.54) + thickness(0.54) * 0.62 + 0.5, 0]}>
        <PixelNoggles u={0.17} />
      </group>
      {fins.map((f, i) => (
        <mesh key={i} geometry={f.geo} position={f.pos} rotation={f.rot}>
          <meshPhysicalMaterial color="#1b1b1b" roughness={0.2} transmission={0.2} thickness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
