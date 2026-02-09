import { searchPosts } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { Sidebar } from "@/components/layout/Sidebar";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const posts = query ? await searchPosts(query) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">搜索结果</h1>
            <p className="text-white/60">
              {query
                ? `找到 ${posts.length} 篇关于 "${query}" 的文章`
                : "请输入搜索关键词"}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="bg-transparent border border-white/10 rounded-lg p-8 text-center">
              <p className="text-white text-lg">未找到相关文章</p>
              <p className="text-white text-sm mt-2">
                尝试更换关键词或查看归档
              </p>
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
