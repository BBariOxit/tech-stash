const fs = require('fs');
const path = require('path');

const snippets = [
  {
    id: "use-window-size",
    title: "useWindowSize Hook",
    language: "TypeScript",
    description: "Custom hook lấy kích thước màn hình, auto-update khi resize.",
    code: `function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}`,
  },
  {
    id: "tailwind-dark-config",
    title: "Tailwind v4 Dark Mode",
    language: "CSS",
    description: "Force dark mode vĩnh viễn trong Tailwind v4 không cần config file.",
    code: `/* globals.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* Force dark trên html tag */
/* <html class="dark"> trong layout.tsx */`,
  },
  {
    id: "next-image-blur",
    title: "Next.js Image với blur placeholder",
    language: "TypeScript",
    description: "Tạo base64 blur placeholder cho ảnh để UX mượt hơn khi load.",
    code: `import Image from 'next/image';

// Generate blur placeholder
const blurData = \`data:image/svg+xml;base64,\${
  Buffer.from('<svg ...>').toString('base64')
}\`;

<Image
  src="/photo.jpg"
  placeholder="blur"
  blurDataURL={blurData}
  fill
  alt="..."
/>`,
  },
  {
    id: "supabase-realtime",
    title: "Supabase Realtime subscription",
    language: "TypeScript",
    description: "Subscribe vào realtime changes của một table trong Supabase.",
    code: `const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log(payload)
  )
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };`,
  },
  {
    id: "zustand-store",
    title: "Zustand Store với TypeScript",
    language: "TypeScript",
    description: "Setup Zustand store đơn giản nhất, đủ dùng cho 80% use case.",
    code: `interface BearState {
  bears: number;
  increase: () => void;
  reset: () => void;
}

const useStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((s) => ({ bears: s.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));`,
  },
  {
    id: "cn-utility",
    title: "cn() utility function",
    language: "TypeScript",
    description: "Merge Tailwind classes đúng cách với clsx + tailwind-merge.",
    code: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
cn('px-4 py-2', isActive && 'bg-blue-500', className)`,
  },
];

const dir = path.join(process.cwd(), 'content', 'snippets');
fs.mkdirSync(dir, { recursive: true });

snippets.forEach(s => {
  const fileContent = `---
title: "${s.title}"
description: "${s.description}"
language: "${s.language}"
date: "2026-04-23"
---

\`\`\`${s.language.toLowerCase() === 'typescript' ? 'ts' : s.language.toLowerCase()}
${s.code}
\`\`\`
`;
  fs.writeFileSync(path.join(dir, `${s.id}.mdx`), fileContent);
});
console.log('MDX files created in content/snippets/');
