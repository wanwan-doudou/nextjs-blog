"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

export function MusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // 加载 APlayer CSS
    if (siteConfig.musicPlayer.enable) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
      document.head.appendChild(cssLink);
    }
  }, []);

  useEffect(() => {
    // 当两个脚本都加载完成时，初始化播放器
    if (scriptsLoaded >= 2) {
      initPlayer();
    }
  }, [scriptsLoaded]);

  const initPlayer = () => {
    const container = document.getElementById("meting-container");
    if (!container || container.children.length > 0) return;

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
    metingEl.setAttribute("list-folded", "false");
    metingEl.setAttribute("fixed", "false");

    container.appendChild(metingEl);
  };

  if (!siteConfig.musicPlayer.enable || !mounted) return null;

  return (
    <>
      <Card className="bg-transparent border-white/10 text-white shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-400" />
            音乐播放器
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-lg overflow-hidden">
            <div id="meting-container" className="aplayer-transparent" />
          </div>
        </CardContent>
      </Card>
      <Script
        src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded((prev) => prev + 1)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js"
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded((prev) => prev + 1)}
      />
    </>
  );
}
