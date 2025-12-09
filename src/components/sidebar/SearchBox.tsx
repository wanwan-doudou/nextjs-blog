"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10">
      <CardContent className="p-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            type="text"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
          />
        </form>
      </CardContent>
    </Card>
  );
}
