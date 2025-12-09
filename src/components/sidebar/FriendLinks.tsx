import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { Heart } from "lucide-react";

export function FriendLinks() {
  if (!siteConfig.friendLinks || siteConfig.friendLinks.length === 0) {
    return null;
  }

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          友情链接
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {siteConfig.friendLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
