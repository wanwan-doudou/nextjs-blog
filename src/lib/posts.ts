import fs from "fs";
import path from "path";
import { cache } from "react";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

// 文章目录
const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  categories: string[];
  preview?: string;
  top?: boolean;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

function normalizeDate(input?: string): string {
  return input ? new Date(input).toISOString() : new Date().toISOString();
}

function buildExcerpt(markdown: string, fallback?: string): string {
  if (fallback) return fallback;

  return (
    markdown
      .replace(/^#+\s+.+$/gm, "") // 移除标题
      .replace(/```[\s\S]*?```/g, "") // 移除代码块
      .replace(/`[^`]+`/g, "") // 移除行内代码
      .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接转文字
      .replace(/\*\*([^*]+)\*\*/g, "$1") // 移除粗体
      .replace(/\*([^*]+)\*/g, "$1") // 移除斜体
      .replace(/^>\s+/gm, "") // 移除引用
      .replace(/^[-*+]\s+/gm, "") // 移除无序列表标记
      .replace(/^\d+\.\s+/gm, "") // 移除有序列表标记
      .replace(/\|[^|]+\|/g, "") // 移除表格
      .replace(/---+/g, "") // 移除分隔线
      .replace(/\n+/g, " ") // 换行转空格
      .replace(/\s+/g, " ") // 多空格合并
      .trim()
      .slice(0, 200) + "..."
  );
}

// 确保目录存在
function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

const readPostFile = cache(
  async (
    slug: string
  ): Promise<{ data: Record<string, unknown>; markdown: string } | null> => {
    ensurePostsDirectory();
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = await fs.promises.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    return { data: data as Record<string, unknown>, markdown: content };
  }
);

// 获取所有文章的slug
export function getPostSlugs(): string[] {
  ensurePostsDirectory();
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export const getPostMetaBySlug = cache(
  async (slug: string): Promise<PostMeta | null> => {
    const file = await readPostFile(slug);
    if (!file) return null;

    const { data, markdown } = file;
    const stats = readingTime(markdown);

    return {
      slug,
      title: (data.title as string | undefined) || slug,
      date: normalizeDate(data.date as string | undefined),
      excerpt: buildExcerpt(markdown, data.excerpt as string | undefined),
      tags: (data.tags as string[] | undefined) || [],
      categories: (data.categories as string[] | undefined) || [],
      preview: data.preview as string | undefined,
      top: (data.top as boolean | undefined) || false,
      readingTime: stats.text,
    };
  }
);

// 根据slug获取文章数据（包含 HTML 正文）
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = await readPostFile(slug);
  if (!file) return null;

  const meta = await getPostMetaBySlug(slug);
  if (!meta) return null;

  const processedContent = await remark().use(html).process(file.markdown);
  const contentHtml = processedContent.toString();

  return { ...meta, content: contentHtml };
}

const getAllPostsMetaSorted = cache(async (): Promise<PostMeta[]> => {
  const slugs = getPostSlugs();
  const metas = await Promise.all(slugs.map((slug) => getPostMetaBySlug(slug)));
  const allPosts = metas.filter(Boolean) as PostMeta[];

  // 按日期排序，置顶文章优先
  allPosts.sort((a, b) => {
    if (a.top && !b.top) return -1;
    if (!a.top && b.top) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return allPosts;
});

// 获取所有文章（带分页）
export async function getAllPosts(
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const allPosts = await getAllPostsMetaSorted();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const posts = allPosts.slice(start, start + limit);

  return { posts, total, totalPages };
}

// 获取所有标签
export async function getAllTags(): Promise<
  { name: string; count: number }[]
> {
  const posts = await getAllPostsMetaSorted();
  const tagCount: Record<string, number> = {};

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 根据标签获取文章
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await getAllPostsMetaSorted();
  return posts.filter((post) => post.tags.includes(tag));
}

// 获取归档数据（按年月分组）
export async function getArchives(): Promise<
  { year: string; months: { month: string; posts: PostMeta[] }[] }[]
> {
  const posts = await getAllPostsMetaSorted();

  const archiveMap: Record<string, Record<string, PostMeta[]>> = {};

  posts.forEach((post) => {
    const date = new Date(post.date);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    if (!archiveMap[year]) archiveMap[year] = {};
    if (!archiveMap[year][month]) archiveMap[year][month] = [];
    archiveMap[year][month].push(post);
  });

  return Object.entries(archiveMap)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .map(([year, months]) => ({
      year,
      months: Object.entries(months)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([month, posts]) => ({ month, posts })),
    }));
}

// 获取最新文章
export async function getRecentPosts(limit: number = 5): Promise<PostMeta[]> {
  const posts = await getAllPostsMetaSorted();
  return posts.slice(0, limit);
}

// 获取随机文章
export async function getRandomPosts(limit: number = 5): Promise<PostMeta[]> {
  const posts = await getAllPostsMetaSorted();
  const shuffled = [...posts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
