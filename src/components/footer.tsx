import Link from "next/link";
import { Terminal } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/icons";

const footerLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/snippets", label: "Snippets" },
  { href: "/about", label: "About" },
  { href: "/rss.xml", label: "RSS" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] py-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400/50" />
          <span className="font-mono text-xs text-zinc-600">
            &copy; {year} Thai Bao — tech-stash
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-3 bg-white/[0.08]" />
          <Link
            href="https://github.com/thaibao"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="https://twitter.com/thaibao"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            <TwitterIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
