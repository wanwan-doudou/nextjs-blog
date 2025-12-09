import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { LinkIcon, Github } from "lucide-react";

export function PersonalLinks() {
  if (!siteConfig.links || siteConfig.links.length === 0) {
    return null;
  }

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-cyan-400" />
          个人链接
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {siteConfig.links.map((link) => (
            <li key={link.name}>
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                {link.name.toLowerCase().includes("github") && (
                  <Github className="w-4 h-4" />
                )}
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
