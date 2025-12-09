import fs from "fs";
import path from "path";
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

// 确保目录存在
function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

// 获取所有文章的slug
export function getPostSlugs(): string[] {
  ensurePostsDirectory();
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

// 根据slug获取文章数据
export async function getPostBySlug(slug: string): Promise<Post | null> {
  ensurePostsDirectory();
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 处理Markdown
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // 计算阅读时间
  const stats = readingTime(content);

  // 生成摘要
  const excerpt =
    data.excerpt ||
    content
      .replace(/^#+\s+.+$/gm, "") // 移除标题
      .replace(/\n/g, " ")
      .slice(0, 200) + "...";

  return {
    slug,
    title: data.title || slug,
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    excerpt,
    tags: data.tags || [],
    categories: data.categories || [],
    preview: data.preview,
    top: data.top || false,
    readingTime: stats.text,
    content: contentHtml,
  };
}

// 获取所有文章（带分页）
export async function getAllPosts(
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const slugs = getPostSlugs();
  const allPosts: PostMeta[] = [];

  for (const slug of slugs) {
    const post = await getPostBySlug(slug);
    if (post) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...meta } = post;
      allPosts.push(meta);
    }
  }

  // 按日期排序，置顶文章优先
  allPosts.sort((a, b) => {
    if (a.top && !b.top) return -1;
    if (!a.top && b.top) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
  const slugs = getPostSlugs();
  const tagCount: Record<string, number> = {};

  for (const slug of slugs) {
    const post = await getPostBySlug(slug);
    if (post) {
      post.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }
  }

  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 根据标签获取文章
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const { posts } = await getAllPosts(1, 1000);
  return posts.filter((post) => post.tags.includes(tag));
}

// 获取归档数据（按年月分组）
export async function getArchives(): Promise<
  { year: string; months: { month: string; posts: PostMeta[] }[] }[]
> {
  const { posts } = await getAllPosts(1, 1000);

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
  const { posts } = await getAllPosts(1, limit);
  return posts;
}

// 获取随机文章
export async function getRandomPosts(limit: number = 5): Promise<PostMeta[]> {
  const { posts } = await getAllPosts(1, 1000);
  const shuffled = [...posts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
