"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";

/** Adapted from the Gnars website: render a WebGL scene only where WebGL works. */
let cached: boolean | undefined;
function hasWebGLSupport() {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    cached = !!gl;
  } catch {
    cached = false;
  }
  return cached;
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[webgl] globe failed, falling back", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const noop = () => () => {};

export function WebGLGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const supported = useSyncExternalStore(noop, hasWebGLSupport, () => false);
  if (!supported) return <>{fallback}</>;
  return <Boundary fallback={fallback}>{children}</Boundary>;
}
