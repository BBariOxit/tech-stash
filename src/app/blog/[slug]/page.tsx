import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { PostContent } from "@/components/post-content";

// Next.js 16: params is a Promise
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-zinc-300 transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Blog
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-primary/20 text-primary/70 font-mono"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-zinc-400 mb-8 pb-8 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.reading_time} phút đọc
            </span>
          </div>

          {/* Content */}
          {post.content ? (
            <PostContent content={post.content} />
          ) : (
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-300 text-lg leading-relaxed">{post.excerpt}</p>
              <div className="mt-8 p-6 rounded-xl border border-dashed border-white/10 text-center text-zinc-400">
                <p className="text-sm text-zinc-500">// TODO: Nội dung bài viết đầy đủ sẽ được thêm vào đây</p>
                <p className="text-xs mt-2">Đây là placeholder — integrate với MDX hoặc CMS sau.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}
