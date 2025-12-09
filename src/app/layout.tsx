import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Slideshow } from "@/components/layout/Slideshow";
import { MusicPlayer } from "@/components/features/MusicPlayer";
import { SakanaWidget } from "@/components/features/SakanaWidget";
import { BackToTop } from "@/components/features/BackToTop";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Slideshow />
        <Header />
        <main className="flex-1 pt-14">
          {children}
        </main>
        <Footer />
        <MusicPlayer />
        <SakanaWidget />
        <BackToTop />
      </body>
    </html>
  );
}
