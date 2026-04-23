import { codeToHtml } from 'shiki';
import { CopyButton } from '@/components/copy-button';

// Map language sang file extension phổ biến
const LANG_EXT: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  css: 'css',
  bash: 'sh',
  html: 'html',
  json: 'json',
  tsx: 'tsx',
  jsx: 'jsx',
  python: 'py',
  sql: 'sql',
};

interface CodeBlockProps {
  code: string;
  lang: string;
  filename?: string;
}

export async function CodeBlock({ code, lang, filename }: CodeBlockProps) {
  const normalizedLang = lang.toLowerCase();
  const ext = LANG_EXT[normalizedLang] ?? normalizedLang;
  const displayFilename = filename ?? `snippet.${ext}`;

  const html = await codeToHtml(code, {
    lang: normalizedLang,
    theme: 'vitesse-dark',
  });

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d0d10]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          {/* Macos dots */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs font-mono text-zinc-500">{displayFilename}</span>
        </div>
        <CopyButton code={code} />
      </div>

      {/* Code */}
      <div
        className="overflow-x-auto p-5 text-sm [&>pre]:!bg-transparent [&>pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
