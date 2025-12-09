import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { Pagination } from "@/components/posts/Pagination";
import { Sidebar } from "@/components/layout/Sidebar";
import { siteConfig } from "@/config/site";

export default async function Home() {
  const { posts, totalPages } = await getAllPosts(1, siteConfig.postsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-8 text-center">
              <p className="text-white/70 text-lg">暂无文章</p>
              <p className="text-white/50 text-sm mt-2">
                请在 content/posts 目录下添加 Markdown 文章
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
              <Pagination currentPage={1} totalPages={totalPages} />
            </>
          )}
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
