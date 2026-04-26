"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/posts";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect width='400' height='220' fill='%2318181b'/%3E%3Crect x='160' y='80' width='80' height='60' rx='6' fill='%2327272a'/%3E%3Ccircle cx='200' cy='105' r='14' fill='%2322d3ee' opacity='0.25'/%3E%3C/svg%3E";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="h-full rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden card-hover flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-40 overflow-hidden bg-zinc-900 shrink-0">
            <img
              src={post.thumbnail || PLACEHOLDER_IMG}
              alt={post.title}
              className="w-full h-full object-cover opacity-50 group-hover:scale-[1.04] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 border-zinc-700/60 text-zinc-300 font-mono"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors leading-snug line-clamp-2 flex-1">
              {post.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-auto pt-3 border-t border-white/[0.05]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString("vi-VN")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.reading_time} phút đọc
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

interface LatestPostsProps {
  posts: Post[];
}

export default function LatestPosts({ posts }: LatestPostsProps) {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-primary/60 mb-2 flex items-center gap-2">
              <span className="w-4 h-px bg-primary/40" />
              LATEST POSTS
            </div>
            <h2 className="text-2xl font-bold text-white">Hàng mới ra lò</h2>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-primary transition-colors font-medium"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
