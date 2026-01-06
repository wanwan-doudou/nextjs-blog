"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Slideshow = dynamic(
  () => import("@/components/layout/Slideshow").then((m) => m.Slideshow),
  { ssr: false }
);

const SakanaWidget = dynamic(
  () => import("@/components/features/SakanaWidget").then((m) => m.SakanaWidget),
  { ssr: false }
);

const BackToTop = dynamic(
  () => import("@/components/features/BackToTop").then((m) => m.BackToTop),
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

  const id = window.setTimeout(cb, 800);
  return () => window.clearTimeout(id);
}

export function ClientEnhancements() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => scheduleIdle(() => setEnabled(true)), []);

  if (!enabled) return null;

  return (
    <>
      <Slideshow />
      <SakanaWidget />
      <BackToTop />
    </>
  );
}

