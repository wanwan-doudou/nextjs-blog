
import { siteConfig } from "@/config/site";
import { LinkCategory } from "@/components/links/LinkCategory";

export const metadata = {
  title: `我的收藏 - ${siteConfig.title}`,
  description: "收集的一些有趣的网站和工具",
};

export default function LinksPage() {
  if (!siteConfig.bookmarks || siteConfig.bookmarks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-transparent border border-white/10 rounded-lg p-8 text-center">
          <p className="text-white text-lg">暂无收藏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold text-white">我的收藏</h1>
          <p className="text-white/60">收集的一些有趣的网站、工具和朋友们的博客</p>
        </div>

        {siteConfig.bookmarks.map((category) => (
          <LinkCategory
            key={category.title}
            title={category.title}
            items={category.items}
          />
        ))}
      </div>
    </div>
  );
}
