"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/posts";
import { dummySiteConfig } from "@/data";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%2318181b'/%3E%3Crect x='340' y='160' width='120' height='80' rx='8' fill='%2327272a'/%3E%3Ccircle cx='400' cy='190' r='20' fill='%2322d3ee' opacity='0.3'/%3E%3C/svg%3E";

interface HeroSectionProps {
  featured: Post;
}

export default function HeroSection({ featured }: HeroSectionProps) {
  return (
    <section className="pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Available for collaboration
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              {dummySiteConfig.greeting}{" "}
              <span className="gradient-text">{dummySiteConfig.author}.</span>
            </h1>

            <p className="text-xl text-zinc-300 font-medium mb-3">
              {dummySiteConfig.welcomeText}{" "}
              <span className="font-mono text-cyan-400">{dummySiteConfig.siteName}</span>
            </p>

            <p className="text-zinc-300 leading-relaxed text-sm max-w-md">
              {dummySiteConfig.description}
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-400 text-zinc-950 text-sm font-semibold hover:bg-cyan-300 transition-colors"
              >
                Đọc bài viết
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/snippets"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 text-zinc-300 text-sm font-medium hover:border-white/20 hover:text-white transition-colors"
              >
                Code Snippets
              </Link>
            </div>
          </motion.div>

          {/* Right: Featured Post Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <div className="text-xs font-mono text-cyan-400/60 mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-cyan-400/40" />
              FEATURED POST
            </div>

            <Link href={`/blog/${featured.slug}`} className="group block">
              <article className="relative rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden card-hover">
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-zinc-900">
                  <img
                    src={PLACEHOLDER_IMG}
                    alt={featured.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
                  {/* Tags overlay */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {featured.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-zinc-900/80 text-zinc-300 border-zinc-700/50 text-xs backdrop-blur-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                    {featured.title}
                  </h2>
                  <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2 mb-4">
                    {featured.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(featured.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {featured.readTime}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Đọc thêm <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
