import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, Home, ChevronRight, Tags } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          <Card className="bg-transparent border-white/10 shadow-none">
            <CardHeader className="space-y-4">
              {/* 面包屑 */}
              <nav className="flex items-center gap-2 text-sm text-white">
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  首页
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white line-clamp-1">{post.title}</span>
              </nav>

              {/* 标题 */}
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {post.title}
              </h1>

              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.date), "yyyy年MM月dd日", {
                    locale: zhCN,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </span>
                {post.tags.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Tags className="w-4 h-4" />
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-white/10 hover:bg-cyan-500/30 text-white hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <article
                className="prose-gal"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
