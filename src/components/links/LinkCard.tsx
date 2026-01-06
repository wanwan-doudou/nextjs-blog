
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface LinkItem {
  name: string;
  desc: string;
  link: string;
  icon: string;
}

interface LinkCardProps {
  item: LinkItem;
}

export function LinkCard({ item }: LinkCardProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="bg-transparent border-white/10 hover:border-cyan-400/50 transition-all duration-300 h-full overflow-hidden group-hover:bg-white/5">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="relative w-12 h-12 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
            {item.icon ? (
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized // Typically bookmark icons are external links
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/50">
                {item.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                {item.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
            </div>
            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {item.desc}
            </p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
