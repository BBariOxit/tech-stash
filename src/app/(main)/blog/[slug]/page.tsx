import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { PostContent } from "@/components/post-content";
import { BlogPostLayout, type TocHeading } from "@/components/table-of-contents";
import { CommentSection } from "@/components/comments/CommentSection";

/** Extract h2/h3 headings from raw HTML and inject `id` attributes */
function extractHeadings(html: string): { headings: TocHeading[]; html: string } {
  const headings: TocHeading[] = [];
  const slugCount: Record<string, number> = {};

  const processed = html.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs, inner) => {
    const level = parseInt(tag[1]);
    const text = inner.replace(/<[^>]+>/g, "").trim();

    let slug = text
      .toLowerCase()
      .replace(/[^\w\sÀ-ỹ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (slugCount[slug] !== undefined) {
      slugCount[slug]++;
      slug = `${slug}-${slugCount[slug]}`;
    } else {
      slugCount[slug] = 0;
    }

    headings.push({ id: slug, text, level });
    return `<${tag}${attrs} id="${slug}">${inner}</${tag}>`;
  });

  return { headings, html: processed };
}

// Next.js 16: params is a Promise
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const { headings, html: contentWithIds } = extractHeadings(post.content ?? "");

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Layout: article (animatable) + sticky ToC */}
          <BlogPostLayout headings={headings}>
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors mb-6 font-medium group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
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
              <PostContent content={contentWithIds} />
            ) : (
              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 text-lg leading-relaxed">{post.excerpt}</p>
                <div className="mt-8 p-6 rounded-xl border border-dashed border-white/10 text-center text-zinc-400">
                  <p className="text-sm text-zinc-500">// Nội dung bài viết sẽ được thêm vào đây</p>
                </div>
              </div>
            )}

            {/* Comment section — only available for posts with a DB id */}
            {post.id && <CommentSection postId={post.id} />}
          </BlogPostLayout>
        </div>
    </div>
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
