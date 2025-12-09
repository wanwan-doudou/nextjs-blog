"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 生成随机图片URL
    const { apiUrls, apiCount } = siteConfig.slideBackground;
    const generatedImages: string[] = [];

    for (let i = 0; i < apiCount; i++) {
      const randomApi = apiUrls[Math.floor(Math.random() * apiUrls.length)];
      // 添加随机参数避免缓存
      generatedImages.push(`${randomApi}?t=${Date.now()}-${i}`);
    }

    setImages(generatedImages);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  if (!loaded || images.length === 0) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      {images.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${src})`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
