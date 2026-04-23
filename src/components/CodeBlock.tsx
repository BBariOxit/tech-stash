import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang: string;
}

export async function CodeBlock({ code, lang }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: lang,
    theme: 'vitesse-dark', // Dark, beautiful theme
  });

  return (
    <div 
      className="snippet-code rounded-xl overflow-hidden border border-white/[0.08]"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
