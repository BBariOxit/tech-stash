"use client";

import { useState, useMemo } from "react";
import { Network, Calendar, Clock, Hash } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/posts";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect width='400' height='220' fill='%2318181b'/%3E%3Crect x='160' y='80' width='80' height='60' rx='6' fill='%2327272a'/%3E%3Ccircle cx='200' cy='105' r='14' fill='%2322d3ee' opacity='0.25'/%3E%3C/svg%3E";

interface DsaPageClientProps {
  posts: Post[];
}

export default function DsaPageClient({ posts }: DsaPageClientProps) {
  const [activeTag, setActiveTag] = useState("Tất cả");

  // Build filter tags dynamically từ dữ liệu thật (bỏ tag "DSA" vì đang ở trang DSA)
  const filterTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags) {
        if (tag.toLowerCase() !== "dsa") tagSet.add(tag);
      }
    }
    return ["Tất cả", ...Array.from(tagSet).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeTag === "Tất cả") return posts;
    return posts.filter((p) => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-24">

      {/* ══════════════════════
          HEADER — Compact
      ══════════════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-3">
          <Network className="size-4 shrink-0" />
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase opacity-80">
            Ngách Thuật Toán
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
          Data Structures{" "}
          <span className="text-zinc-600">&amp;&amp; Algorithms.</span>
        </h1>

        <p className="text-zinc-400 text-sm max-w-xl">
          Tập hợp các bài viết giải ngố thuật toán. Không code thừa, chỉ có tư duy tối ưu.
        </p>
      </div>

      {/* ══════════════════════
          FILTER BAR
      ══════════════════════ */}
      <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-white/[0.06]">
        {filterTags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 border",
                isActive
                  ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                  : "bg-zinc-900/60 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════
          EXECUTION STACK
      ══════════════════════ */}
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center font-mono text-sm text-zinc-600
                        border border-dashed border-zinc-800 rounded-xl">
          // Không tìm thấy bài viết nào với tag này.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {filteredPosts.map((post, index) => {
            const formattedDate = new Date(post.date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            const displayTags = post.tags.filter((t) => t.toLowerCase() !== "dsa");

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex min-h-[152px]
                           bg-[#111113] border border-white/[0.10] rounded-xl
                           overflow-hidden
                           hover:border-primary/40
                           hover:shadow-[0_0_24px_rgba(34,211,238,0.07)]
                           transition-all duration-300"
                aria-label={`Đọc bài: ${post.title}`}
              >
                {/* Thumbnail */}
                <div className="w-40 sm:w-52 h-full relative overflow-hidden shrink-0 border-r border-white/[0.08]">
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10
                                  opacity-0 group-hover:opacity-100
                                  transition-opacity duration-500 pointer-events-none" />
                  <img
                    src={post.thumbnail || PLACEHOLDER_IMG}
                    alt={post.title}
                    className="w-full h-full object-cover
                               opacity-100
                               group-hover:scale-[1.04]
                               transition-all duration-700 ease-out"
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-400 mb-2">
                    <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shrink-0">
                      [{index}]
                    </span>
                    <span className="hidden sm:flex items-center gap-1 shrink-0">
                      <Calendar className="size-3" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="size-3" />
                      {post.reading_time} phút đọc
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-sm sm:text-base font-bold text-white
                                 group-hover:text-primary transition-colors duration-200
                                 line-clamp-2 leading-snug mb-1.5">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="max-sm:hidden text-zinc-400 text-xs line-clamp-2 mb-2 mt-0.5">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {displayTags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2.5">
                      {displayTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-1.5 py-0.5
                                     text-[9px] font-mono text-zinc-400
                                     bg-zinc-800/60 border border-zinc-700 rounded uppercase tracking-wide"
                        >
                          <Hash className="size-2.5 shrink-0" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
