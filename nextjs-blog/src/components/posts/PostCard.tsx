import Link from "next/link";
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
  // 生成随机封面图
  const getRandomCover = () => {
    if (post.preview) return post.preview;
    const apis = siteConfig.defaultPreview.apiUrls;
    const randomApi = apis[Math.floor(Math.random() * apis.length)];
    return `${randomApi}?slug=${post.slug}`;
  };

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        {/* 封面图 */}
        <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${getRandomCover()})` }}
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
        <div className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-xl font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
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
            <p className="text-white/70 text-sm line-clamp-3">{post.excerpt}</p>
          </CardContent>
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 5).map((tag) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 hover:bg-cyan-500/30 text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
