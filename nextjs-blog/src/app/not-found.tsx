import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">页面未找到</h2>
        <p className="text-white/60 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上页
          </Button>
        </div>
      </div>
    </div>
  );
}
