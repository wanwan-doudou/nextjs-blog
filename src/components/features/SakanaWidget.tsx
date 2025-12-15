"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import Script from "next/script";

export function SakanaWidget() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  if (!siteConfig.sakanaWidget.enable || !mounted || !isDesktop) return null;

  const { position } = siteConfig.sakanaWidget;

  const initSakana = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).SakanaWidget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SakanaWidget = (window as any).SakanaWidget;
      new SakanaWidget({ character: "takina" }).mount("#sakana-widget");
    }
  };

  return (
    <>
      <div
        id="sakana-widget"
        className="sakana-widget fixed z-30"
        style={{
          bottom: position.bottom,
          right: position.right,
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js"
        strategy="lazyOnload"
        onLoad={initSakana}
      />
    </>
  );
}
