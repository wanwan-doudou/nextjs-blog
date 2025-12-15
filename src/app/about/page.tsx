import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";
import { User, Github, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "关于我",
  description: "关于博主",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          <Card className="bg-transparent border-white/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-cyan-400" />
                关于我
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像和基本信息 */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage
                    src={siteConfig.authorImage}
                    alt={siteConfig.author}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-cyan-500 to-pink-500">
                    {siteConfig.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {siteConfig.author}
                  </h2>
                  <p className="text-white">{siteConfig.description}</p>
                </div>
              </div>

              {/* 个人链接 */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">联系方式</h3>
                <div className="flex flex-wrap gap-4">
                  {siteConfig.links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-cyan-500/30 rounded-lg text-white hover:text-cyan-400 transition-colors"
                    >
                      {link.name.toLowerCase().includes("github") && (
                        <Github className="w-4 h-4" />
                      )}
                      {link.name.toLowerCase().includes("mail") && (
                        <Mail className="w-4 h-4" />
                      )}
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 关于博客 */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">关于本站</h3>
                <div className="prose-gal">
                  <p>
                    这是一个使用 Next.js 14 重构的博客，基于原 Hexo Gal 主题设计。
                  </p>
                  <p>技术栈：</p>
                  <ul>
                    <li>Next.js 14 (App Router)</li>
                    <li>TailwindCSS</li>
                    <li>shadcn/ui</li>
                    <li>Lucide Icons</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <Sidebar />
      </div>
    </div>
  );
}
