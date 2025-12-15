import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";
import { getAllTags } from "@/lib/posts";

export async function HotTags() {
  const tags = await getAllTags();
  const hotTags = tags.slice(0, 15);

  if (hotTags.length === 0) {
    return null;
  }

  return (
    <Card className="bg-transparent border-white/10 text-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tags className="w-4 h-4 text-pink-400" />
          热门标签
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag) => (
            <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Badge
                variant="secondary"
                className="bg-white/10 hover:bg-cyan-500/30 text-white hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {tag.name} ({tag.count})
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
