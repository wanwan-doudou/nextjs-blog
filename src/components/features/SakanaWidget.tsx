"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SakanaWidget: any;
  }
}

export function SakanaWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!siteConfig.sakanaWidget.enable) return;

    // 动态加载 Sakana Widget
    const loadSakana = async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js";
      script.async = true;

      script.onload = () => {
        if (containerRef.current && window.SakanaWidget && !widgetRef.current) {
          widgetRef.current = window.SakanaWidget.init({
            el: containerRef.current,
            character: "takina", // 可选: "takina" 或 "chisato"
            inertia: 0.01,
            decay: 0.99,
            r: 60,
            y: 10,
            scale: 0.5,
            translateY: 0,
          });
        }
      };

      document.head.appendChild(script);
    };

    loadSakana();

    return () => {
      if (widgetRef.current) {
        // 清理
        widgetRef.current = null;
      }
    };
  }, []);

  if (!siteConfig.sakanaWidget.enable) return null;

  const { position } = siteConfig.sakanaWidget;

  return (
    <div
      ref={containerRef}
      className="fixed z-30 cursor-pointer"
      style={{
        bottom: position.bottom,
        right: position.right,
      }}
    />
  );
}
