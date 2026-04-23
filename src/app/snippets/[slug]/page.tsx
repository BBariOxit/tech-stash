import { getSnippetById, getAllSnippets } from "@/lib/snippets-mdx";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Terminal } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/CodeBlock";
import { CopyButton } from "@/components/copy-button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export async function generateStaticParams() {
  const snippets = getAllSnippets();
  return snippets.map((snippet) => ({
    slug: snippet.id,
  }));
}

export default async function SnippetDetailPage({ params }: { params: { slug: string } }) {
  const snippet = getSnippetById(params.slug);

  if (!snippet) {
    notFound();
  }

  const components = {
    pre: (props: any) => {
      const code = props.children.props.children;
      const lang = props.children.props.className?.replace("language-", "") || "text";
      return (
        <div className="relative group my-8">
          <CopyButton code={code} />
          <CodeBlock code={code} lang={lang} />
        </div>
      );
    },
    p: (props: any) => <p className="text-zinc-300 leading-relaxed mb-6" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold text-white mt-12 mb-6" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside text-zinc-300 mb-6 space-y-2" {...props} />,
    li: (props: any) => <li {...props} />,
    a: (props: any) => <a className="text-primary hover:underline" {...props} />,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/snippets"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors mb-12 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Snippets
          </Link>

          <article>
            <header className="mb-12 border-b border-white/[0.08] pb-12">
              <div className="flex items-center gap-3 mb-6 text-sm">
                <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  {snippet.language}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {snippet.date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                {snippet.title}
              </h1>
              
              <p className="text-xl text-zinc-400 leading-relaxed">
                {snippet.description}
              </p>
            </header>

            <div className="prose prose-invert max-w-none">
              {/* We cast to any because next-mdx-remote types can be picky sometimes */}
              <MDXRemote source={snippet.content} components={components as any} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
