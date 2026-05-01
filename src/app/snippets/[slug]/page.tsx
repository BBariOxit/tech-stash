import { getSnippetBySlug, getAllSnippets } from "@/lib/snippets";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Terminal, Heart, Bookmark } from "lucide-react";
import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Metadata } from "next";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  JavaScript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  CSS: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Bash: "text-green-400 bg-green-400/10 border-green-400/20",
};

export async function generateStaticParams() {
  const snippets = await getAllSnippets();
  return snippets.map((snippet) => ({ slug: snippet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const snippet = await getSnippetBySlug(slug);
  if (!snippet) return { title: "Snippet không tồn tại | Tech Stash" };
  return {
    title: `${snippet.title} | Tech Stash`,
    description: snippet.description,
  };
}

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snippet = await getSnippetBySlug(slug);

  if (!snippet) notFound();

  const langColorClass =
    LANG_COLORS[snippet.language] ?? "text-zinc-300 bg-zinc-400/10 border-zinc-400/20";

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── Back button ── */}
          <Link
            href="/snippets"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors mb-12 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Quay lại Snippets
          </Link>

          <article>
            {/* ═══════════════════════════
                  PHẦN 1 · Header
            ═══════════════════════════ */}
            <header className="mb-12 pb-10 border-b border-white/[0.07]">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border font-medium ${langColorClass}`}
                >
                  <Terminal className="w-3 h-3" />
                  {snippet.language}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(snippet.date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {snippet.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-zinc-400 leading-relaxed">
                {snippet.description}
              </p>
            </header>

            {/* ═══════════════════════════
                  PHẦN 2 · Code Content
            ═══════════════════════════ */}
            <div className="mb-8">
              <CodeBlock 
                code={snippet.code} 
                lang={snippet.language.toLowerCase()} 
                filename={snippet.filename} 
              />
            </div>
          </article>

          {/* ═══════════════════════════
                PHẦN 3 · Supabase Placeholder
          ═══════════════════════════ */}
          <div className="mt-16 pt-10 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-sm text-zinc-600 font-mono">
              # {snippet.id.substring(0, 8)}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                title="Coming soon — Supabase"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] text-zinc-600 text-sm cursor-not-allowed"
              >
                <Heart className="w-3.5 h-3.5" />
                Like
              </button>
              <button
                disabled
                title="Coming soon — Supabase"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] text-zinc-600 text-sm cursor-not-allowed"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
