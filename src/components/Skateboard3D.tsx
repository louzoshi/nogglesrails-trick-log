"use client";

import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { Skateboard } from "./three/Skateboard";

const CYCLE = 5.5;
const FLIP = 0.9;

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Showcase pose: on its side so the graphic faces you. Floats, then pops a kickflip every few seconds. */
const POSE = -1.15;
function FlippingBoard({ color, motion }: { color: string; motion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const idle = Math.sin(t * 1.6) * 0.06;
    if (!motion) {
      g.rotation.x = POSE;
      return;
    }
    const phase = (t % CYCLE) - (CYCLE - FLIP);
    if (phase > 0) {
      const p = phase / FLIP;
      g.rotation.x = POSE + easeInOut(p) * Math.PI * 2;
      g.position.y = Math.sin(Math.PI * p) * 0.9;
      g.rotation.z = Math.sin(Math.PI * p) * 0.25; // pop: tail down, nose up
    } else {
      g.rotation.x = POSE;
      g.rotation.z = idle * 0.4;
      g.position.y = idle;
    }
  });
  return (
    <group ref={ref}>
      <Skateboard color={color} />
    </group>
  );
}

const CAMERA = [3, 1.8, 12.5] as const;

/** Narrow canvases (phones) pull the camera closer so the board keeps its size on screen. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const zoom = Math.min(1, size.width / size.height / 1.7);
    const k = Math.max(0.62, zoom);
    camera.position.set(CAMERA[0] * k, CAMERA[1] * k, CAMERA[2] * k);
  }, [camera, size.width, size.height]);
  return null;
}

export default function Skateboard3D({ color }: { color: string }) {
  const motion = typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas flat dpr={[1, 2]} performance={{ min: 0.5 }} gl={{ alpha: true, antialias: true }} style={{ background: "transparent", touchAction: "pan-y" }}>
      <PerspectiveCamera makeDefault position={CAMERA} fov={40} />
      <FitCamera />
      <OrbitControls
        target={[0, 0, 0]}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        autoRotate={motion}
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.8}
      />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={2.2} />
      <directionalLight position={[-6, -3, -2]} intensity={1.1} />
      <Environment preset="studio" background={false} />
      <FlippingBoard color={color} motion={motion} />
    </Canvas>
  );
}
