"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Code2, Copy, Check } from "lucide-react";
import { SnippetMeta } from "@/lib/snippets-mdx";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SnippetsClientProps {
  snippets: SnippetMeta[];
}

export function SnippetsClient({ snippets }: SnippetsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  
  // Extract unique languages for tags
  const tags = ["All", ...Array.from(new Set(snippets.map((s) => s.language)))];

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTag === "All" || snippet.language === activeTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm snippets (ví dụ: useWindowSize, nextjs...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#111113] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                activeTag === tag
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-[#111113] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.2]"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <AnimatePresence>
          {filteredSnippets.map((snippet) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={snippet.id}
            >
              <Link href={`/snippets/${snippet.id}`} className="group block h-full">
                <article className="h-full p-5 rounded-xl border border-white/[0.08] bg-[#111113] card-hover flex flex-col gap-3 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors shrink-0">
                      <Code2 className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08] group-hover:border-primary/20 group-hover:text-primary/70 transition-colors">
                      {snippet.language}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-2 line-clamp-1">
                      {snippet.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {snippet.description}
                    </p>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {filteredSnippets.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          Không tìm thấy snippet nào khớp với tìm kiếm của mày.
        </div>
      )}
    </div>
  );
}
