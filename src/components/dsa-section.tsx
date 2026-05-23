"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { Network, Braces, ChevronRight, GitBranch } from "lucide-react";
import type { Post } from "@/lib/posts";

// ─── Complexity badge helper ────────────────────────────────────────────────
function getComplexity(tags: string[]): string {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  if (tagSet.has("dynamic programming") || tagSet.has("dp")) return "O(n²)";
  if (tagSet.has("graph") || tagSet.has("dijkstra")) return "O(V+E)";
  if (tagSet.has("tree") || tagSet.has("bfs") || tagSet.has("dfs"))
    return "O(n)";
  if (tagSet.has("binary search")) return "O(log n)";
  if (tagSet.has("sorting")) return "O(n log n)";
  return "O(n)";
}

// ─── Animated graph decoration ──────────────────────────────────────────────
function GraphDecoration() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="w-full max-w-[200px] opacity-70 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Edges */}
      <line x1="30" y1="30" x2="100" y2="80" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="100" y1="80" x2="170" y2="40" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="100" y1="80" x2="130" y2="140" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="30" y1="30" x2="60" y2="130" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="60" y1="130" x2="130" y2="140" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.45" />
      <line x1="170" y1="40" x2="130" y2="140" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4" />

      {/* Nodes – animated */}
      <circle cx="30" cy="30" r="5" fill="#22d3ee">
        <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="80" r="7" fill="#22d3ee">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="7;9;7" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="40" r="5" fill="#22d3ee">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="130" r="4" fill="#22d3ee">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="140" r="5" fill="#22d3ee">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Node labels */}
      <text x="36" y="26" fill="#22d3ee" fontSize="8" opacity="0.9" fontFamily="monospace">root</text>
      <text x="106" y="76" fill="#22d3ee" fontSize="8" opacity="0.9" fontFamily="monospace">V</text>
      <text x="176" y="36" fill="#22d3ee" fontSize="8" opacity="0.9" fontFamily="monospace">E₁</text>
      <text x="36" y="145" fill="#22d3ee" fontSize="8" opacity="0.8" fontFamily="monospace">E₂</text>
      <text x="135" y="155" fill="#22d3ee" fontSize="8" opacity="0.8" fontFamily="monospace">E₃</text>
    </svg>
  );
}

// ─── Variants ───────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Props ──────────────────────────────────────────────────────────────────
interface DsaSectionProps {
  posts: Post[];
}

export default function DsaSection({ posts }: DsaSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section
      className="py-16 px-4 sm:px-6 border-t border-white/5"
      aria-label="Data Structures & Algorithms posts"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* ══════════════════════════════════════════════
              CỘT TRÁI — Title + Đồ hoạ Graph (Sticky)
          ══════════════════════════════════════════════ */}
          <div className="lg:w-1/3 lg:sticky lg:top-28 h-fit">
            {/* Eye-brow */}
            <div className="flex items-center gap-2.5 text-primary mb-4">
              <Network className="size-5 shrink-0" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-80">
                Kho tàng thuật toán
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
              Data Structures
              <br />
              <span className="text-zinc-600">&amp; Algorithms.</span>
            </h2>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              Nơi cất giấu những bí kíp giải ngố thuật toán, tối ưu code và
              vượt ải phỏng vấn. Từ mảng cơ bản đến đồ thị phức tạp.
            </p>

            {/* Animated graph illustration */}
            <div className="hidden md:block mb-8">
              <GraphDecoration />
            </div>

            {/* Complexity legend */}
            <div className="hidden md:flex flex-col gap-2 font-mono text-[11px] text-zinc-400">
              {[
                { label: "O(1)", desc: "— Constant" },
                { label: "O(log n)", desc: "— Logarithmic" },
                { label: "O(n)", desc: "— Linear" },
                { label: "O(n²)", desc: "— Quadratic" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-primary">{label}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              CỘT PHẢI — Danh sách kiểu Linked List
          ══════════════════════════════════════════════ */}
          <div className="lg:w-2/3 relative">
            {/* Đường trục dọc nối các Node */}
            <div
              aria-hidden="true"
              className="absolute left-[11px] top-5 bottom-10 w-px bg-gradient-to-b from-primary/40 via-zinc-800 to-transparent z-0"
            />

            <motion.div
              className="flex flex-col gap-1"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {posts.map((post, index) => {
                const complexity = getComplexity(post.tags);
                const formattedDate = new Date(post.date).toLocaleDateString(
                  "vi-VN",
                  { day: "2-digit", month: "2-digit", year: "numeric" }
                );

                return (
                  <motion.div key={post.slug} variants={itemVariants as any}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group relative flex items-start gap-6 pl-10 sm:pl-12 py-5 rounded-xl -mr-4 sm:-mr-6
                                 hover:bg-zinc-800/60
                                 transition-all duration-300"
                      aria-label={`Đọc bài: ${post.title}`}
                    >
                      {/* Node — chấm tròn trên đường trục */}
                      <span
                        aria-hidden="true"
                        className="absolute left-2 top-1/2 -translate-y-1/2 size-3 rounded-full
                                   bg-zinc-700 border border-zinc-600 z-10
                                   transition-all duration-300
                                   group-hover:bg-primary group-hover:border-primary
                                   group-hover:ring-2 group-hover:ring-primary/30 group-hover:scale-110"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          <span className="text-zinc-400 text-xs font-mono">
                            {formattedDate}
                          </span>

                          {/* Complexity badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded
                                           text-[10px] font-mono
                                           bg-primary/10 text-primary
                                           border border-primary/20">
                            <Braces className="size-3 shrink-0" />
                            {complexity}
                          </span>

                          {/* Reading time */}
                          <span className="text-zinc-400 text-[10px] font-mono">
                            ~{post.reading_time}m read
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-white
                                       transition-colors duration-200 group-hover:text-primary
                                       leading-snug line-clamp-2 mb-3">
                          {post.title}
                        </h3>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono text-zinc-300
                                         bg-zinc-800/60 px-2 py-0.5 rounded
                                         border border-zinc-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>

                    {/* Divider trừ item cuối */}
                    {index < posts.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="ml-10 sm:ml-12 h-px bg-white/[0.08]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA — xem tất cả */}
            <div className="mt-8 pl-10 sm:pl-12">
              <Link
                href="/blog?tag=DSA"
                className="group inline-flex items-center gap-2
                           text-sm font-mono text-zinc-300
                           hover:text-primary transition-colors duration-200"
                aria-label="Khám phá tất cả bài DSA"
              >
                <GitBranch className="size-4 shrink-0
                                      group-hover:rotate-90 transition-transform duration-300" />
                <span>[ Khám phá toàn bộ hệ thống ]</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
