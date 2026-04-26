"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

export function PostContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    
    // Tìm tất cả các block code và apply highlight.js
    const blocks = contentRef.current.querySelectorAll("pre code");
    blocks.forEach((block) => {
      // Bỏ qua nếu đã highlight rồi
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block as HTMLElement);
      }
    });
  }, [content]);  return (
    <div
      ref={contentRef}
      className="prose prose-invert prose-cyan max-w-none prose-pre:bg-[#282c34] prose-pre:m-0 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-code:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
