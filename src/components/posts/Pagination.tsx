import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath || "/";
    return `${basePath}/page/${page}`;
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {/* 上一页 */}
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="text-white/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* 页码 */}
      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="text-white/50 px-2">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        return (
          <Link key={pageNum} href={getPageUrl(pageNum)}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10",
                pageNum === currentPage
                  ? "bg-cyan-500/30 text-cyan-400"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {pageNum}
            </Button>
          </Link>
        );
      })}

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="text-white/30"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </nav>
  );
}
