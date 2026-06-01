import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

// 强行关闭该 API 的静态缓存，确保每次请求都获取最新的随机图
export const dynamic = "force-dynamic";

async function getRealImageUrl(randomApi: string): Promise<string> {
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    // 1. 优先尝试 HEAD 请求，自动跟随重定向，以最低带宽开销获取最终的真实图片 CDN 地址
    const res = await fetch(randomApi, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": userAgent },
      next: { revalidate: 0 },
    });
    if (res.url && res.url !== randomApi) {
      return res.url;
    }
  } catch (err) {
    console.warn("HEAD request failed for:", randomApi, err);
  }

  try {
    // 2. 降级方案：使用 GET 请求并手动拦截 302/307 状态码获取 location 响应头
    const res = await fetch(randomApi, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": userAgent },
      next: { revalidate: 0 },
    });
    const location = res.headers.get("location");
    if (location) {
      return location;
    }
  } catch (err) {
    console.warn("GET manual redirect request failed for:", randomApi, err);
  }

  // 3. 兜底方案：返回带有时间戳的原随机 API 地址
  return `${randomApi}?t=${Date.now()}-${Math.random()}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const countParam = url.searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : siteConfig.wallpaper.batchSize;

  const { pcApiUrls } = siteConfig.wallpaper;
  if (!pcApiUrls || pcApiUrls.length === 0) {
    return NextResponse.json({ error: "No wallpaper APIs configured" }, { status: 500 });
  }

  // 随机生成所需要的 API 列表
  const apisToFetch: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomApi = pcApiUrls[Math.floor(Math.random() * pcApiUrls.length)];
    apisToFetch.push(randomApi);
  }

  try {
    // 并发解析所有随机 API 的最终真实图片地址，保证极高的响应速度
    const imageUrls = await Promise.all(
      apisToFetch.map((api) => getRealImageUrl(api))
    );

    return NextResponse.json({ images: imageUrls });
  } catch (err) {
    console.error("Failed to fetch random wallpapers:", err);
    return NextResponse.json(
      { error: "Failed to generate wallpaper list" },
      { status: 502 }
    );
  }
}
