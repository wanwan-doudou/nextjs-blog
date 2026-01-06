"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Archive, Image, User, Menu, X, Link as LinkIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useState } from "react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Archive,
  Image,
  User,
  Link: LinkIcon,
};

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 md:backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Title */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-cyan-400 transition-all duration-300"
            style={{
              textShadow:
                "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #228DFF, 0 0 35px #228DFF",
            }}
          >
            {siteConfig.navbarText || siteConfig.title}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {siteConfig.menu.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url);

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            {siteConfig.menu.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url);

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item.title}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
