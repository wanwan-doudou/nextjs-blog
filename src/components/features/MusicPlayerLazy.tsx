"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MusicPlayer = dynamic(
  () => import("@/components/features/MusicPlayer").then((m) => m.MusicPlayer),
  { ssr: false }
);

function scheduleIdle(cb: () => void) {
  if (typeof window === "undefined") return () => {};

  const w = window as unknown as {
    requestIdleCallback?: (fn: () => void, opts?: { timeout?: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout: 2000 });
    return () => w.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}

export function MusicPlayerLazy() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => scheduleIdle(() => setEnabled(true)), []);

  if (!enabled) return null;
  return <MusicPlayer />;
}

