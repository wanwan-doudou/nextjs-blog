import { getPostsByTag, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: encodeURIComponent(t.name) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `标签: ${decodedTag}`,
    description: `包含标签 ${decodedTag} 的文章`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          <Card className="bg-transparent border-white/10 shadow-none mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Tag className="w-5 h-5 text-cyan-400" />
                标签: {decodedTag}
                <span className="text-sm font-normal text-white">
                  ({posts.length} 篇文章)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>

          {posts.length === 0 ? (
            <div className="bg-transparent border border-white/10 rounded-lg p-8 text-center">
              <p className="text-white">暂无文章</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
