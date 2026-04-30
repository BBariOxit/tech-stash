import { codeToHtml } from 'shiki';

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

async function highlightHtml(html: string) {
  // Tìm tất cả các thẻ <pre><code> (có hoặc không có class language)
  const regex = /<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...html.matchAll(regex)];
  let newHtml = html;
  
  for (const match of matches) {
    const [fullMatch, lang, code] = match;
    
    // Tiptap thường escape HTML trong code block, nên ta cần unescape trước khi đưa vào shiki
    const unescapedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const normalizedLang = (lang || 'text').toLowerCase();
    const ext = LANG_EXT[normalizedLang] ?? normalizedLang;
    const displayFilename = `code.${ext}`;

    let highlighted;
    try {
      highlighted = await codeToHtml(unescapedCode, {
        lang: normalizedLang,
        theme: 'one-dark-pro',
      });
    } catch (e) {
      // Fallback nếu shiki không support ngôn ngữ này
      highlighted = await codeToHtml(unescapedCode, {
        lang: 'text',
        theme: 'one-dark-pro',
      });
    }
    
    // Bọc kết quả shiki vào UI giống với trang Snippet
    const replacementHtml = `
      <div class="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0d0d10] my-6">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div class="flex items-center gap-2.5">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
            </div>
            <span class="text-xs font-mono text-zinc-500">${displayFilename}</span>
          </div>
        </div>
        <div class="overflow-x-auto p-5 text-sm [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!border-none">
          ${highlighted}
        </div>
      </div>
    `;
    
    newHtml = newHtml.replace(fullMatch, replacementHtml);
  }
  
  return newHtml;
}

export async function PostContent({ content }: { content: string }) {
  // Parse và highlight HTML ngay trên Server
  const highlightedContent = await highlightHtml(content);

  return (
    <div
      className="prose prose-invert prose-cyan max-w-none"
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  );
}
