import { notFound, permanentRedirect } from "next/navigation";
import { getAllPosts } from "@/lib/posts";
import { PostListPage } from "@/components/posts/PostListPage";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ page: string }>;
}

async function getTotalPages(): Promise<number> {
  const { totalPages } = await getAllPosts(1, siteConfig.postsPerPage);
  return totalPages;
}

// URL 里的页码必须是正整数，"2.5"、"abc"、"01" 之类一律视为无效
function parsePageParam(page: string): number | null {
  if (!/^[1-9]\d*$/.test(page)) return null;
  return Number(page);
}

export async function generateStaticParams() {
  const totalPages = await getTotalPages();
  // 第 1 页由首页 "/" 承载，这里只预渲染第 2 页起
  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { page } = await params;
  const currentPage = parsePageParam(page);
  const totalPages = await getTotalPages();

  if (currentPage === null || currentPage > totalPages) {
    return { title: "页面未找到" };
  }

  return {
    title: `文章列表 - 第 ${currentPage} 页`,
    description: `${siteConfig.description} - 第 ${currentPage} 页`,
  };
}

export default async function PostsPaginationPage({ params }: PageProps) {
  const { page } = await params;
  const currentPage = parsePageParam(page);
  const totalPages = await getTotalPages();

  if (currentPage === null || currentPage > totalPages) {
    notFound();
  }

  // 第 1 页的正规地址是 "/"，重定向避免同一批文章有两个 URL
  if (currentPage === 1) {
    permanentRedirect("/");
  }

  return <PostListPage currentPage={currentPage} />;
}
