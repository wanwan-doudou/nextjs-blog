import { siteConfig } from "@/config/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/70 backdrop-blur-md border-t border-white/10 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/60 text-sm">
            © {currentYear} {siteConfig.title}. All rights reserved.
          </div>
          <div className="text-white/60 text-sm">
            Powered by{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Next.js
            </a>
            {" | "}
            Theme:{" "}
            <span className="text-pink-400">Gal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
