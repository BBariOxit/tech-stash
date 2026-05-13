"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { codeToTokensBase } from "shiki";

const codeContent = `const profile = {
  name: "Phan Thai Bao",
  role: "Full-stack Developer",
  skills: {
    frontend: ["React", "Next.js", "Tailwind css"],
    backend: ["Node.js", "Express.js"],
    database: ["PostgreSQL", "MongoDB", "Supabase", "Firebase"]
  },
  status: "Available for collaboration"
};`;

interface TokenInfo {
  content: string;
  color: string;
}

export function TerminalProfile() {
  const [tokens, setTokens] = useState<TokenInfo[][] | null>(null);

  useEffect(() => {
    let isTerminated = false;

    async function loadTokens() {
      try {
        const result = await codeToTokensBase(codeContent, {
          lang: "typescript",
          theme: "github-dark-high-contrast",
        });

        if (!isTerminated) {
          // Flatten tokens for easier animation, or keep arrays of lines.
          // Since we want to stagger each character or token, staggering tokens is what the user asked for.
          const tokenLines = result.map(line =>
            line.map(token => ({
              content: token.content,
              color: token.color || "#fff"
            }))
          );
          setTokens(tokenLines);
        }
      } catch (error) {
        console.error("Error loading shiki:", error);
      }
    }

    loadTokens();

    return () => {
      isTerminated = true;
    };
  }, []);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-[#121212] border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-[#1e1e1e] border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-sm font-medium text-zinc-400">Phan Thái Bảo</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-words min-h-50">
        {!tokens ? (
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-zinc-500"
          >
            Initializing terminal...
          </motion.div>
        ) : (
          <motion.pre
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className="m-0"
          >
            {tokens.map((line, lineIdx) => (
              <div key={lineIdx} className="table-row">
                <span className="table-cell select-none opacity-30 text-right pr-4 text-xs">
                  {lineIdx + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, tokenIdx) => (
                    <motion.span
                      key={tokenIdx}
                      variants={{
                        hidden: { opacity: 0, display: "none" },
                        visible: { opacity: 1, display: "inline" },
                      }}
                      style={{ color: token.color }}
                    >
                      {token.content}
                    </motion.span>
                  ))}
                  {lineIdx === tokens.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 bg-zinc-400 align-middle ml-1"
                    />
                  )}
                </span>
              </div>
            ))}
          </motion.pre>
        )}
      </div>
    </div>
  );
}