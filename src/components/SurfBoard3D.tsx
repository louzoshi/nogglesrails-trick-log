"use client";

import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { Surfboard } from "./three/Surfboard";

/** Rides the illustrated wave: bobs, rolls and trims; drag turns it, then it settles back. */
function RidingBoard({ color, motion }: { color: string; motion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const drag = useRef<{ x: number; yaw: number } | null>(null);
  const yawOffset = useRef(0);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = motion ? clock.getElapsedTime() : 0;
    if (!drag.current) yawOffset.current *= Math.pow(0.08, dt); // ease back to the riding line
    g.position.y = Math.sin(t * 1.9) * 0.12;
    g.rotation.x = 0.34 + Math.sin(t * 1.3) * 0.05; // deck tilted toward the viewer
    g.rotation.z = 0.02 + Math.sin(t * 1.9 + 0.6) * 0.04; // nose rises with the swell
    g.rotation.y = -0.12 + Math.sin(t * 0.7) * 0.06 + yawOffset.current;
  });

  return (
    <group
      ref={ref}
      position={[-0.7, -0.85, 0]}
      scale={0.62}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, yaw: yawOffset.current };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) yawOffset.current = drag.current.yaw + (e.clientX - drag.current.x) * 0.012;
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <Surfboard color={color} />
    </group>
  );
}

export default function SurfBoard3D({ color }: { color: string }) {
  const motion = typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas flat dpr={[1, 2]} performance={{ min: 0.5 }} gl={{ alpha: true, antialias: true }} style={{ background: "transparent", touchAction: "pan-y" }}>
      <PerspectiveCamera makeDefault position={[0, 1.6, 14]} fov={30} />
      <ambientLight intensity={0.8} />
      {/* Warm key light from the setting sun (right), cool fill from the sky. */}
      <directionalLight position={[8, 3, 4]} intensity={2.4} color="#ffd2a1" />
      <directionalLight position={[-6, 6, 6]} intensity={1.0} color="#bfe3ff" />
      <Environment preset="sunset" background={false} />
      <RidingBoard color={color} motion={motion} />
    </Canvas>
  );
}
