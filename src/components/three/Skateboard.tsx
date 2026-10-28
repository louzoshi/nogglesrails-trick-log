"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { deckGraphicTexture, gripTexture } from "./board-textures";

/** Procedural skateboard, x = length (nose at +x), y = up. Units ≈ inches / 4. */
const L = 8;
const W = 2.1;
const T = 0.14;
const KICK_START = 2.9;
const TRUCK_X = 2.5;

/** Nose/tail kick + a little concave. */
function lift(x: number, z: number) {
  const k = Math.max(0, Math.abs(x) - KICK_START);
  return k * k * 0.34 + (z / (W / 2)) ** 2 * 0.05;
}

function bend(geo: THREE.BufferGeometry) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + lift(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  return geo;
}

function deckFace(top: boolean) {
  const geo = new THREE.PlaneGeometry(L, W, 96, 12);
  geo.rotateX(top ? -Math.PI / 2 : Math.PI / 2);
  geo.translate(0, top ? T / 2 : -T / 2, 0);
  return bend(geo);
}

/** Popsicle outline, sampled densely so the wall bends with the kicks. */
function outline(n = 180) {
  const r = W / 2;
  const straight = L - W;
  const perim = 2 * straight + 2 * Math.PI * r;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * perim;
    if (d < straight) {
      pts.push([-straight / 2 + d, -r]);
      continue;
    }
    d -= straight;
    if (d < Math.PI * r) {
      const a = -Math.PI / 2 + d / r;
      pts.push([straight / 2 + Math.cos(a) * r, Math.sin(a) * r]);
      continue;
    }
    d -= Math.PI * r;
    if (d < straight) {
      pts.push([straight / 2 - d, r]);
      continue;
    }
    d -= straight;
    const a = Math.PI / 2 + d / r;
    pts.push([-straight / 2 + Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

function deckWall() {
  const pts = outline();
  const pos: number[] = [];
  const idx: number[] = [];
  pts.forEach(([x, z], i) => {
    pos.push(x, T / 2 + lift(x, z) - 0.002, z, x, -T / 2 + lift(x, z) + 0.002, z);
    const j = (i + 1) % pts.length;
    idx.push(i * 2, j * 2, i * 2 + 1, j * 2, j * 2 + 1, i * 2 + 1);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function Truck({ x }: { x: number }) {
  const metal = { color: "#c9ccd1", metalness: 0.9, roughness: 0.28 } as const;
  return (
    <group position={[x, -T / 2, 0]}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.55]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.38]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
        <meshStandardMaterial color="#e8312a" roughness={0.6} />
      </mesh>
      {/* hanger + axle */}
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.7, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.3, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, -0.36, side * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.28, 40]} />
            <meshStandardMaterial color="#f3ede2" roughness={0.55} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 24]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Skateboard({ color }: { color: string }) {
  const top = useMemo(() => deckFace(true), []);
  const bottom = useMemo(() => deckFace(false), []);
  const wall = useMemo(() => deckWall(), []);
  const grip = useMemo(() => gripTexture(), []);
  const graphic = useMemo(() => deckGraphicTexture(color), [color]);
  useEffect(() => () => graphic.dispose(), [graphic]);

  return (
    <group>
      <mesh geometry={top}>
        <meshStandardMaterial map={grip} alphaTest={0.5} roughness={1} envMapIntensity={0.15} />
      </mesh>
      <mesh geometry={bottom}>
        <meshPhysicalMaterial map={graphic} alphaTest={0.5} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      <mesh geometry={wall}>
        <meshStandardMaterial color="#d9b47c" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <Truck x={TRUCK_X} />
      <Truck x={-TRUCK_X} />
    </group>
  );
}
