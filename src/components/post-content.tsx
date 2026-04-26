"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

export function PostContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    // Tìm tất cả các block code và apply highlight.js không cần check class
    const blocks = contentRef.current.querySelectorAll("pre code");
    blocks.forEach((block) => {
      // Ép highlight.js chạy lại trên block này (xóa dấu hiệu đã xử lý)
      block.removeAttribute("data-highlighted");
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-invert prose-cyan max-w-none prose-pre:bg-[#282c34] prose-pre:m-0 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
