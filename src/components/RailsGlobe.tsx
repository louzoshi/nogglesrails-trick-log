"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { activityRings, RING_STYLE, type Activity, type ActivityRing } from "@/lib/activity";
import type { Rail } from "@/lib/rails";
import { SPORTS, type Sport } from "@/lib/sports";
import { WebGLGuard } from "./WebGLGuard";

/** Ported from the Gnars website (NogglesRailsGlobe) + activity rings. */
const Globe = dynamic(() => import("react-globe.gl").then((m) => m.default), { ssr: false });

interface GlobePoint {
  lat: number;
  lng: number;
  rail: Rail;
  selected: boolean;
}

const ICON: [number, number] = [30, 30];
/** Camera distance: high enough that the whole planet fits a tall panel. */
const ALTITUDE = 2.3;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RailsGlobe({
  rails,
  activity,
  focusSlug,
  onSelectRail,
  className,
  sport = "skate",
}: {
  sport?: Sport;
  rails: Rail[];
  activity: Activity;
  focusSlug?: string;
  onSelectRail?: (rail: Rail) => void;
  className?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelectRail);
  useEffect(() => {
    onSelectRef.current = onSelectRail;
  }, [onSelectRail]);

  // New array identity on focus change: react-globe.gl only rebuilds markers when the data changes.
  const points: GlobePoint[] = useMemo(
    () => rails.map((r) => ({ lat: r.lat, lng: r.lng, rail: r, selected: r.slug === focusSlug })),
    [rails, focusSlug],
  );
  const rings = useMemo(() => activityRings(rails, activity), [rails, activity]);

  const { marker, ring } = SPORTS[sport];
  const markerElement = useCallback((point: object) => {
    const p = point as GlobePoint;
    const el = document.createElement("div");
    el.style.cursor = "pointer";
    el.style.pointerEvents = "auto";
    el.title = p.rail.title;
    el.innerHTML = `<span style="position:relative;display:block;width:${ICON[0]}px;height:${ICON[1]}px">${
      p.selected
        ? `<span aria-hidden style="position:absolute;left:50%;top:50%;width:${ICON[0] + 16}px;height:${ICON[1] + 16}px;transform:translate(-50%,-50%);border-radius:999px;border:2px solid #22c55e;background:radial-gradient(circle,rgba(34,197,94,.45),rgba(34,197,94,0) 70%);animation:rail-pin-pulse 1.8s ease-in-out infinite"></span>`
        : ""
    }<img src="${marker}" width="${ICON[0]}" height="${ICON[1]}" style="position:relative;filter:drop-shadow(0 0 3px rgba(0,0,0,.6))" /></span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelectRef.current?.(p.rail);
    });
    return el;
  }, [marker]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !focusSlug && !reducedMotion();
    controls.autoRotateSpeed = 0.3;
    controls.minDistance = 200;
    controls.maxDistance = 420;
  }, [size, focusSlug, ready]);

  useEffect(() => {
    if (!ready || !globeRef.current || size.width === 0) return;
    const rail = rails.find((r) => r.slug === focusSlug);
    globeRef.current.pointOfView(
      rail ? { lat: rail.lat, lng: rail.lng, altitude: ALTITUDE } : { altitude: ALTITUDE },
      rail && !reducedMotion() ? 900 : 0,
    );
  }, [focusSlug, rails, size.width, ready]);

  return (
    <div ref={containerRef} className={className}>
      {size.width > 0 && (
        <WebGLGuard>
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            globeImageUrl="https://unpkg.com/three-globe@2.45.0/example/img/earth-blue-marble.jpg"
            bumpImageUrl="https://unpkg.com/three-globe@2.45.0/example/img/earth-topology.png"
            onGlobeReady={() => setReady(true)}
            backgroundColor="rgba(0,0,0,0)"
            atmosphereColor="#6699cc"
            atmosphereAltitude={0.15}
            htmlElementsData={points}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={0.01}
            htmlElement={markerElement}
            ringsData={reducedMotion() ? [] : rings}
            ringLat="lat"
            ringLng="lng"
            ringAltitude={0.005}
            ringMaxRadius={(r: object) => RING_STYLE.maxRadius((r as ActivityRing).heat)}
            ringPropagationSpeed={(r: object) => RING_STYLE.speed((r as ActivityRing).heat)}
            ringRepeatPeriod={(r: object) => RING_STYLE.repeatMs((r as ActivityRing).heat)}
            ringColor={(r: object) => RING_STYLE.color((r as ActivityRing).heat, ring)}
          />
        </WebGLGuard>
      )}
    </div>
  );
}
