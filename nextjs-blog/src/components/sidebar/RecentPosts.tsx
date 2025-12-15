import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import { getRecentPosts } from "@/lib/posts";

export async function RecentPosts() {
  const posts = await getRecentPosts(5);

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-transparent border-white/10 text-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          最新文章
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto max-h-60">
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-sm text-white hover:text-cyan-400 transition-colors line-clamp-1 block"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
