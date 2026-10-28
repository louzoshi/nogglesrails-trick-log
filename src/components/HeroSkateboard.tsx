"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { COLORWAYS } from "@/lib/colorways";
import { ColorwayPicker } from "./ColorwayPicker";
import { WebGLGuard } from "./WebGLGuard";

const Skateboard3D = dynamic(() => import("./Skateboard3D"), { ssr: false, loading: () => <Fallback /> });

function Fallback() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/red_noggles.png" alt="" className="m-auto w-full max-w-[220px] -rotate-6 sm:max-w-[340px]" />;
}

/** Drag-to-spin 3D skateboard with the Noggles Rail colorways on its graphic. */
export function HeroSkateboard() {
  const [color, setColor] = useState<(typeof COLORWAYS)[number]>(COLORWAYS[0]);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-[240px] w-full items-center sm:h-[320px]">
        <WebGLGuard fallback={<Fallback />}>
          <Skateboard3D color={color.value} />
        </WebGLGuard>
      </div>
      <ColorwayPicker value={color} onChange={setColor} />
    </div>
  );
}
