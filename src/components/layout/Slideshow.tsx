"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

export function Slideshow() {
  const [images, setImages] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const intervalMs = Math.max(
    2000,
    siteConfig.slideBackground.intervalMs ?? 10000
  );
  const fadeMs = Math.min(2000, Math.max(600, Math.floor(intervalMs * 0.12)));

  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const [incomingLayer, setIncomingLayer] = useState<0 | 1 | null>(null);
  const [fading, setFading] = useState(false);
  const [layer0Src, setLayer0Src] = useState<string | null>(null);
  const [layer1Src, setLayer1Src] = useState<string | null>(null);
  const [layer0AnimKey, setLayer0AnimKey] = useState(0);
  const [layer1AnimKey, setLayer1AnimKey] = useState(0);

  const currentIndexRef = useRef(0);
  const activeLayerRef = useRef<0 | 1>(0);
  const incomingLayerRef = useRef<0 | 1 | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => {
    incomingLayerRef.current = incomingLayer;
  }, [incomingLayer]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    if (!isDesktop) return;
    const { apiUrls, apiCount } = siteConfig.slideBackground;
    const generatedImages: string[] = [];

    const shuffled = [...apiUrls].sort(() => Math.random() - 0.5);
    for (let i = 0; i < apiCount; i++) {
      const api = shuffled[i % shuffled.length];
      if (api) generatedImages.push(api);
    }

    setImages(generatedImages);
    setLoaded(true);
  }, [isDesktop]);

  useEffect(() => {
    if (images.length === 0) return;

    currentIndexRef.current = 0;
    setActiveLayer(0);
    setIncomingLayer(null);
    setFading(false);

    setLayer0Src(images[0] ?? null);
    setLayer1Src(images.length > 1 ? images[1]! : images[0] ?? null);
    setLayer0AnimKey((v) => v + 1);
    setLayer1AnimKey((v) => v + 1);
  }, [images]);

  useEffect(() => {
    if (images.length === 0) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

    const preloadAndTransition = (fromIndex: number) => {
      if (incomingLayerRef.current !== null) return;
      const toIndex = (fromIndex + 1) % images.length;
      const src = images[toIndex];
      if (!src) return;

      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
      img.onload = () => {
        const nextLayer: 0 | 1 = activeLayerRef.current === 0 ? 1 : 0;

        if (nextLayer === 0) {
          setLayer0Src(src);
          setLayer0AnimKey((v) => v + 1);
        } else {
          setLayer1Src(src);
          setLayer1AnimKey((v) => v + 1);
        }

        setIncomingLayer(nextLayer);
        const rafId = requestAnimationFrame(() => setFading(true));

        transitionTimeoutRef.current = setTimeout(() => {
          cancelAnimationFrame(rafId);
          currentIndexRef.current = toIndex;
          setActiveLayer(nextLayer);
          setIncomingLayer(null);
          setFading(false);
        }, fadeMs);
      };
    };

    intervalRef.current = setInterval(() => {
      preloadAndTransition(currentIndexRef.current);
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [images, intervalMs, fadeMs]);

  if (!isDesktop || !loaded || images.length === 0) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
    );
  }

  const layerOpacity = (layer: 0 | 1) => {
    if (incomingLayer === null) {
      return layer === activeLayer ? 1 : 0;
    }
    if (layer === incomingLayer) return fading ? 1 : 0;
    if (layer === activeLayer) return fading ? 0 : 1;
    return 0;
  };

  const layerAnimationName = (animKey: number) =>
    animKey % 2 === 0 ? "slideshow-kenburns-a" : "slideshow-kenburns-b";

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {layer0Src && (
        <div
          className="slideshow-layer absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${layer0Src})`,
            opacity: layerOpacity(0),
            transition: `opacity ${fadeMs}ms ease-in-out`,
            willChange: "opacity, transform",
            animationName: layerAnimationName(layer0AnimKey),
            animationDuration: `${intervalMs + fadeMs}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
          }}
        />
      )}
      {layer1Src && (
        <div
          className="slideshow-layer absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${layer1Src})`,
            opacity: layerOpacity(1),
            transition: `opacity ${fadeMs}ms ease-in-out`,
            willChange: "opacity, transform",
            animationName: layerAnimationName(layer1AnimKey),
            animationDuration: `${intervalMs + fadeMs}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
          }}
        />
      )}
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
