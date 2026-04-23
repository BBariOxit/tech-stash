"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={onCopy}
      className={cn(
        "absolute right-4 top-4 p-2 rounded-md transition-all",
        "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1]",
        copied && "bg-primary/20 border-primary/40 text-primary"
      )}
      aria-label="Copy code"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-zinc-400" />}
    </button>
  );
}
