"use client";

import * as React from "react";
import { Globe, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "../../../types/supabase";

type Language = Tables<"languages">;

interface LanguagesSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function LanguagesSelect({ value, onChange, error }: LanguagesSelectProps) {
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    supabase
      .from("languages")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setLanguages(data);
        setLoading(false);
      });
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        onChange(val);
      }}
    >
      <SelectTrigger className={`w-full bg-white/5 border-white/10 ${error ? 'border-destructive focus-visible:ring-destructive/50' : 'focus-visible:border-primary/50'} h-10`}>
        <SelectValue placeholder={loading ? "Đang tải..." : "Chọn ngôn ngữ"} />
      </SelectTrigger>
      <SelectContent className="bg-[#111113] border-white/10 text-white">
        {languages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lang.name}</span>
              <span className="text-zinc-500 font-mono text-[11px]">#{lang.slug}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
