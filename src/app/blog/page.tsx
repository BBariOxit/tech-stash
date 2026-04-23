import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { posts } from "@/lib/posts";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Tất cả bài viết về Web Development, DevOps, và linh tinh khác.",
};

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='220' viewBox='0 0 400 220'%3E%3Crect width='400' height='220' fill='%2318181b'/%3E%3Crect x='160' y='80' width='80' height='60' rx='6' fill='%2327272a'/%3E%3Ccircle cx='200' cy='105' r='14' fill='%2322d3ee' opacity='0.25'/%3E%3C/svg%3E";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="text-xs font-mono text-primary/60 mb-2 flex items-center gap-2">
              <span className="w-4 h-px bg-primary/40" />
              ALL POSTS
            </div>
            <h1 className="text-3xl font-bold text-white">Blog</h1>
            <p className="text-zinc-300 text-sm mt-2">
              {posts.length} bài viết — sắp xếp theo ngày mới nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full rounded-xl border border-white/[0.08] bg-[#111113] overflow-hidden card-hover flex flex-col">
                  <div className="relative h-40 overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={PLACEHOLDER_IMG}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    {post.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-700/60 text-zinc-300 font-mono">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-sm font-semibold text-white group-hover:text-primary transition-colors leading-snug line-clamp-2 flex-1">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-auto pt-3 border-t border-white/[0.05]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
