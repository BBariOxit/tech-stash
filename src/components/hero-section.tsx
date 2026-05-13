"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/posts";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%2318181b'/%3E%3Crect x='340' y='160' width='120' height='80' rx='8' fill='%2327272a'/%3E%3Ccircle cx='400' cy='190' r='20' fill='%2322d3ee' opacity='0.3'/%3E%3C/svg%3E";

interface HeroSectionProps {
  featured: Post;
}

export default function HeroSection({ featured }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        
        {/* Status pill */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Available for collaboration
        </motion.div>

        {/* Typography / Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6"
        >
          Building Fast, Secure, and <span className="gradient-text">Scalable Web.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Tao là Thái Bảo. Đây là ổ chứa code snippet và những bài viết thực chiến 
          hàng ngày từ công việc Full-stack Developer của tao.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20"
        >
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-zinc-950 text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105"
          >
            Đọc bài viết
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/snippets"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-sm font-medium hover:border-white/20 hover:text-white hover:bg-white/10 transition-all"
          >
            Code Snippets
          </Link>
        </motion.div>

        {/* Featured Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="w-full text-left"
        >
          <div className="text-xs font-mono text-primary/60 mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary/40" />
            FEATURED POST
            <span className="w-8 h-px bg-primary/40" />
          </div>

          <Link href={`/blog/${featured.slug}`} className="group block w-full">
            <article className="relative rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden card-hover flex flex-col md:flex-row h-auto md:h-56">
              {/* Thumbnail */}
              <div className="relative w-full md:w-2/5 h-48 md:h-full overflow-hidden bg-zinc-900 shrink-0">
                <img
                  src={featured.thumbnail || PLACEHOLDER_IMG}
                  alt={featured.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#111113] via-transparent to-transparent" />
                {/* Tags overlay */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-zinc-900/80 text-zinc-300 border-zinc-700/50 text-xs backdrop-blur-sm px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors leading-snug mb-3">
                  {featured.title}
                </h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 mb-5">
                  {featured.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs md:text-sm text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featured.date).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.reading_time} phút đọc
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-primary font-semibold flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Đọc thêm <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
