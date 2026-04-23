import { getSnippetById, getAllSnippets } from "@/lib/snippets-mdx";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Terminal, Heart, Bookmark } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/CodeBlock";
import { CopyButton } from "@/components/copy-button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Metadata } from "next";

// Map language → extension cho CodeBlock header
const LANG_EXT: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  css: "css",
  bash: "sh",
  html: "html",
  json: "json",
  tsx: "tsx",
  jsx: "jsx",
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  JavaScript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  CSS: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Bash: "text-green-400 bg-green-400/10 border-green-400/20",
};

export async function generateStaticParams() {
  const snippets = getAllSnippets();
  return snippets.map((snippet) => ({ slug: snippet.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const snippet = getSnippetById(slug);
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
  const snippet = getSnippetById(slug);

  if (!snippet) notFound();

  const langKey = snippet.language.toLowerCase();
  const ext = LANG_EXT[langKey] ?? langKey;
  const filename = `snippet.${ext}`;
  const langColorClass =
    LANG_COLORS[snippet.language] ?? "text-zinc-300 bg-zinc-400/10 border-zinc-400/20";

  // Extract raw code string from MDX content (block đầu tiên)
  const codeMatch = snippet.content.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  const rawCode = codeMatch ? codeMatch[1].trim() : snippet.content.trim();

  // MDX components — override pre/code để inject CodeBlock & CopyButton
  const components = {
    pre: (props: React.ComponentProps<"pre">) => {
      const child = (props.children as React.ReactElement<{ props: { children: string; className?: string } }>);
      const code = child?.props?.children ?? "";
      const lang =
        child?.props?.className?.replace("language-", "") || "text";
      return (
        <CodeBlock code={code} lang={lang} filename={`snippet.${LANG_EXT[lang] ?? lang}`} />
      );
    },
    p: (props: React.ComponentProps<"p">) => (
      <p className="text-zinc-300 leading-relaxed mb-5" {...props} />
    ),
    h2: (props: React.ComponentProps<"h2">) => (
      <h2 className="text-xl font-bold text-white mt-10 mb-4" {...props} />
    ),
    h3: (props: React.ComponentProps<"h3">) => (
      <h3 className="text-lg font-semibold text-white mt-6 mb-3" {...props} />
    ),
    ul: (props: React.ComponentProps<"ul">) => (
      <ul className="list-disc list-inside text-zinc-300 mb-5 space-y-1.5" {...props} />
    ),
    li: (props: React.ComponentProps<"li">) => <li {...props} />,
    a: (props: React.ComponentProps<"a">) => (
      <a className="text-primary hover:underline" {...props} />
    ),
    strong: (props: React.ComponentProps<"strong">) => (
      <strong className="text-white font-semibold" {...props} />
    ),
    code: (props: React.ComponentProps<"code">) => (
      <code
        className="px-1.5 py-0.5 rounded bg-white/[0.07] text-primary font-mono text-sm"
        {...props}
      />
    ),
  };

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
                  {snippet.date}
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
                  PHẦN 2 · MDX Content
                  (giải thích, context...)
            ═══════════════════════════ */}
            <div className="mb-8">
              <MDXRemote source={snippet.content} components={components as any} />
            </div>
          </article>

          {/* ═══════════════════════════
                PHẦN 3 · Supabase Placeholder
                (Like / Bookmark — future)
          ═══════════════════════════ */}
          <div className="mt-16 pt-10 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-sm text-zinc-600 font-mono">
              {/* ID snippet để sau dùng với Supabase */}
              # {snippet.id}
            </p>
            <div className="flex items-center gap-2">
              {/* Placeholder — sẽ connect Supabase sau */}
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
