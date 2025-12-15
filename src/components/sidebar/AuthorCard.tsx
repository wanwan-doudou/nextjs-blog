import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { Quote } from "lucide-react";

export function AuthorCard() {
  return (
    <Card className="bg-transparent border-white/10 text-white shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 text-sm text-white">
          <Quote className="w-4 h-4 rotate-180" />
          <span>{siteConfig.author}</span>
          <Quote className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="w-32 h-32 border-4 border-white/20">
          <AvatarImage src={siteConfig.authorImage} alt={siteConfig.author} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-500 to-pink-500">
            {siteConfig.author.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <p className="mt-4 text-sm text-white text-center">
          {siteConfig.description}
        </p>
      </CardContent>
    </Card>
  );
}
