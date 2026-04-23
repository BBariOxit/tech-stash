import Link from "next/link";
import { Terminal } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/icons";

import { dummyFooterLinks, dummySiteConfig } from "@/data";

const footerLinks = dummyFooterLinks;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] py-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary/50" />
          <span className="font-mono text-xs text-zinc-400">
            &copy; {year} {dummySiteConfig.author} — {dummySiteConfig.siteName.replace('.', '')}
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-3 bg-white/[0.08]" />
          <Link
            href={dummySiteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={dummySiteConfig.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <TwitterIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
