import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/posts/PostCard";
import { Pagination } from "@/components/posts/Pagination";
import { Sidebar } from "@/components/layout/Sidebar";
import { siteConfig } from "@/config/site";

interface PostListPageProps {
  currentPage: number;
}

// 首页 "/" 与 "/page/[page]" 共用的文章列表主体，避免两处分页渲染逻辑走样
export async function PostListPage({ currentPage }: PostListPageProps) {
  const { posts, totalPages } = await getAllPosts(
    currentPage,
    siteConfig.postsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="bg-transparent border border-white/10 rounded-lg p-8 text-center">
              <p className="text-white text-lg">暂无文章</p>
              <p className="text-white text-sm mt-2">
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
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
