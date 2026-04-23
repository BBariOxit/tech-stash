"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Code2 } from "lucide-react";
import type { Snippet } from "@/lib/snippets";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CSS: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  JavaScript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Bash: "text-green-400 bg-green-400/10 border-green-400/20",
};

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const langClass = LANG_COLORS[snippet.language] ?? "text-zinc-300 bg-zinc-400/10 border-zinc-400/20";

  return (
    <article className="shrink-0 w-[280px] sm:w-[320px] rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden card-hover flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex items-start justify-between gap-2">
        <div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${langClass} mb-2`}>
            <Code2 className="w-2.5 h-2.5" />
            {snippet.language}
          </span>
          <h3 className="text-sm font-semibold text-white leading-snug">
            {snippet.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="px-4 py-2.5 text-xs text-zinc-300 leading-relaxed border-b border-white/[0.04]">
        {snippet.description}
      </p>

      {/* Code preview */}
      <div className="px-4 py-3 flex-1 overflow-hidden relative">
        <pre className="snippet-code text-[11px] leading-relaxed">
          {snippet.code.split("\n").slice(0, 7).join("\n")}
        </pre>
        {/* Fade out bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none" />
      </div>
    </article>
  );
}

interface SnippetsCarouselProps {
  snippets: Snippet[];
}

export default function SnippetsCarousel({ snippets }: SnippetsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 340 : -340,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 px-4 sm:px-6 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-cyan-400/60 mb-2 flex items-center gap-2">
              <span className="w-4 h-px bg-cyan-400/40" />
              CODE SNIPPETS
            </div>
            <h2 className="text-2xl font-bold text-white">Đặc sản của Tech Stash</h2>
            <p className="text-zinc-300 text-sm mt-1">
              Mẹo nhỏ, hook, pattern — copy về dùng liền.
            </p>
          </div>

          {/* Scroll controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        </motion.div>

        {/* Mobile scroll hint */}
        <p className="sm:hidden text-xs text-zinc-400 text-center mt-3">
          Vuốt sang để xem thêm →
        </p>
      </div>
    </section>
  );
}
