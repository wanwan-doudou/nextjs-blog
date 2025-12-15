"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Download, RefreshCw, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function WallpaperPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadImages = (count: number = siteConfig.wallpaper.batchSize) => {
    const { pcApiUrls } = siteConfig.wallpaper;
    const newImages: string[] = [];

    for (let i = 0; i < count; i++) {
      const randomApi = pcApiUrls[Math.floor(Math.random() * pcApiUrls.length)];
      newImages.push(`${randomApi}?t=${Date.now()}-${i}-${Math.random()}`);
    }

    return newImages;
  };

  useEffect(() => {
    setImages(loadImages());
  }, []);

  const handleLoadMore = () => {
    if (images.length >= siteConfig.wallpaper.maxImages) return;
    setLoading(true);
    setTimeout(() => {
      setImages((prev) => [...prev, ...loadImages()]);
      setLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setImages(loadImages());
      setLoading(false);
    }, 500);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `wallpaper-${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-transparent border-white/10 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <ImageIcon className="w-5 h-5 text-cyan-400" />
            壁纸库
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          {/* 图片网格 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(url)}
              >
                <Image
                  src={url}
                  alt={`壁纸 ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(url);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 加载更多 */}
          {images.length < siteConfig.wallpaper.maxImages && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    加载中...
                  </>
                ) : (
                  "加载更多"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <Image
              src={selectedImage}
              alt="壁纸预览"
              width={1920}
              height={1080}
              sizes="(max-width: 768px) 100vw, 80vw"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedImage);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
