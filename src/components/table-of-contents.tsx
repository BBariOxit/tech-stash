"use client";

import * as React from "react";
import { motion } from "motion/react";
import { List } from "lucide-react";

export interface TocHeading {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>(headings[0]?.id ?? "");

  React.useEffect(() => {
    if (headings.length === 0) return;

    // ── IntersectionObserver: track headings in viewport ──
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // ── Scroll listener: force-activate last heading at page bottom ──
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight - 50;

      if (isAtBottom) {
        setActiveId(headings[headings.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 pl-4">
        <List className="w-3 h-3 text-primary/50 shrink-0" />
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
          On this page
        </span>
      </div>

      {/* Nav */}
      <nav>
        <ul className="relative flex flex-col gap-0.5">
          {/* Static left border track */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />

          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const isH3 = heading.level === 3;

            return (
              <li key={heading.id} className="relative">
                {/* Animated sliding indicator */}
                {isActive && (
                  <motion.div
                    layoutId="toc-active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-px bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(heading.id);
                    if (el) {
                      window.scrollTo({ top: el.offsetTop - 96, behavior: "smooth" });
                      setActiveId(heading.id);
                    }
                  }}
                  className={[
                    "flex py-1.5 pr-2 text-[13px] leading-snug transition-colors duration-200",
                    isH3 ? "pl-8" : "pl-4",
                    isActive
                      ? "text-primary font-medium"
                      : "text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  <span className="line-clamp-2">{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
