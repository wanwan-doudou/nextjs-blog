import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientEnhancements } from "@/components/layout/ClientEnhancements";
import { siteConfig } from "@/config/site";

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
      <body className="font-sans antialiased min-h-screen flex flex-col text-white">
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
        <ClientEnhancements />
        <Header />
        <main className="flex-1 pt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
