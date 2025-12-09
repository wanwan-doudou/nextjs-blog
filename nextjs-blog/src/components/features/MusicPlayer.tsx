"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { Music, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    APlayer: any;
  }
}

export function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    if (!siteConfig.musicPlayer.enable) return;

    // 动态加载 APlayer
    const loadAPlayer = async () => {
      // 加载CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
      document.head.appendChild(cssLink);

      // 加载JS
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js";
      script.async = true;
      
      script.onload = () => {
        // 加载 MetingJS
        const metingScript = document.createElement("script");
        metingScript.src = "https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js";
        metingScript.async = true;
        metingScript.onload = () => {
          initPlayer();
        };
        document.head.appendChild(metingScript);
      };
      
      document.head.appendChild(script);
    };

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      const { playlistId, server, autoplay, volume, theme } = siteConfig.musicPlayer;

      // 创建 meting-js 元素
      const metingEl = document.createElement("meting-js");
      metingEl.setAttribute("server", server);
      metingEl.setAttribute("type", "playlist");
      metingEl.setAttribute("id", playlistId);
      metingEl.setAttribute("autoplay", autoplay ? "true" : "false");
      metingEl.setAttribute("theme", theme);
      metingEl.setAttribute("volume", volume.toString());
      metingEl.setAttribute("order", "list");
      metingEl.setAttribute("list-folded", "true");
      metingEl.setAttribute("fixed", "false");
      
      containerRef.current.appendChild(metingEl);
    };

    loadAPlayer();

    return () => {
      const player = playerRef.current;
      if (player) {
        player.destroy();
      }
    };
  }, []);

  if (!siteConfig.musicPlayer.enable) return null;

  return (
    <div
      className={`fixed left-4 z-40 transition-all duration-300 ${
        minimized ? "bottom-4" : "bottom-4"
      }`}
    >
      {minimized ? (
        <Button
          onClick={() => setMinimized(false)}
          className="rounded-full w-12 h-12 bg-black/70 hover:bg-black/90 border border-white/20"
        >
          <Music className="w-5 h-5 text-cyan-400" />
        </Button>
      ) : (
        <div className="bg-black/80 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden w-80">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-sm text-white/80 flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400" />
              {siteConfig.musicPlayer.title}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-white/60 hover:text-white"
                onClick={() => setMinimized(true)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div ref={containerRef} className="aplayer-container" />
        </div>
      )}
    </div>
  );
}
