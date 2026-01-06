"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";

export function MusicPlayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <meting-js
              id={siteConfig.musicPlayer.playlistId}
              server={siteConfig.musicPlayer.server}
              type="playlist"
              fixed="false"
              autoplay={siteConfig.musicPlayer.autoplay}
              loop="all"
              order="list"
              preload="auto"
              list-folded="true"
              list-max-height="340px"
              lrc-type="0"
              class="aplayer-transparent"
            />
          </div>
        </CardContent>
      </Card>
      <Script
        src="https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js"
        strategy="lazyOnload"
      />
    </>
  );
}
