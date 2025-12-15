import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Pin } from "lucide-react";
import { PostMeta } from "@/lib/posts";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { siteConfig } from "@/config/site";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const stableIndex = (input: string, modulo: number) => {
    if (modulo <= 0) return 0;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash % modulo;
  };

  // 生成稳定封面图（避免每次渲染都换图 + 便于浏览器缓存）
  const getCover = () => {
    if (post.preview) return post.preview;
    const apis = siteConfig.defaultPreview.apiUrls;
    const api = apis[stableIndex(post.slug, apis.length)] ?? apis[0];
    return `${api}?slug=${encodeURIComponent(post.slug)}`;
  };

  const postUrl = `/posts/${encodeURIComponent(post.slug)}`;
  const coverUrl = getCover();

  return (
    <Link href={postUrl} className="block">
      <Card className="bg-transparent border-white/10 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 cursor-pointer shadow-none">
        <div className="flex flex-col md:flex-row">
          {/* 封面图 */}
          <div className="md:w-64 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
            <Image
              src={coverUrl}
              alt={`${post.title} 封面`}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
            {post.top && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-pink-500 text-white">
                  <Pin className="w-3 h-3 mr-1" />
                  置顶
                </Badge>
              </div>
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 flex flex-col min-w-0">
            <CardHeader className="pb-2">
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.date), "yyyy-MM-dd", { locale: zhCN })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-white text-sm line-clamp-3">{post.excerpt}</p>
            </CardContent>
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/10 text-white text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
