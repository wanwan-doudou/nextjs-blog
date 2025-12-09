import { getArchives } from "@/lib/posts";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "归档",
  description: "文章归档",
};

export default async function ArchivesPage() {
  const archives = await getArchives();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          <Card className="bg-black/50 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Archive className="w-5 h-5 text-cyan-400" />
                文章归档
              </CardTitle>
            </CardHeader>
            <CardContent>
              {archives.length === 0 ? (
                <p className="text-white/60">暂无文章</p>
              ) : (
                <div className="space-y-8">
                  {archives.map((yearGroup) => (
                    <div key={yearGroup.year}>
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-400" />
                        {yearGroup.year}年
                      </h2>
                      <div className="space-y-4">
                        {yearGroup.months.map((monthGroup) => (
                          <div key={monthGroup.month} className="pl-4">
                            <h3 className="text-lg font-semibold text-white/80 mb-2">
                              {monthGroup.month}月
                            </h3>
                            <ul className="space-y-2 pl-4 border-l border-white/20">
                              {monthGroup.posts.map((post) => (
                                <li key={post.slug} className="relative">
                                  <div className="absolute -left-[9px] top-2 w-2 h-2 bg-cyan-400 rounded-full" />
                                  <Link
                                    href={`/posts/${post.slug}`}
                                    className="block pl-4 py-1 text-white/70 hover:text-cyan-400 transition-colors"
                                  >
                                    <span className="text-sm text-white/50 mr-2">
                                      {new Date(post.date).getDate()}日
                                    </span>
                                    {post.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
