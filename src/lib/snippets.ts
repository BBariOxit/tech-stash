import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Snippet {
  id: string;
  slug: string;
  title: string;
  description: string;
  code: string;
  filename: string;
  language: string; // from languages.name
  languageSlug: string; // from languages.slug, used for shiki
  date: string;
  tags: string[];
}

export async function getAllSnippets(): Promise<Snippet[]> {
  const { data, error } = await supabase
    .from("snippets")
    .select(`
      *,
      languages (
        name,
        slug
      ),
      snippet_tags (
        tags (
          name
        )
      )
    `)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching snippets:", error);
    return [];
  }

  return data.map((snippet: any) => ({
    id: snippet.id,
    slug: snippet.slug,
    title: snippet.title,
    description: snippet.description || "",
    code: snippet.code || "",
    filename: snippet.filename || "snippet.ts",
    language: snippet.languages?.name || "Text",
    languageSlug: snippet.languages?.slug || "text",
    date: snippet.created_at,
    tags: snippet.snippet_tags?.map((st: any) => st.tags?.name).filter(Boolean) || [],
  }));
}

export async function getSnippetBySlug(slug: string): Promise<Snippet | null> {
  const { data, error } = await supabase
    .from("snippets")
    .select(`
      *,
      languages (
        name,
        slug
      ),
      snippet_tags (
        tags (
          name
        )
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description || "",
    code: data.code || "",
    filename: data.filename || "snippet.ts",
    language: data.languages?.name || "Text",
    languageSlug: data.languages?.slug || "text",
    date: data.created_at,
    tags: data.snippet_tags?.map((st: any) => st.tags?.name).filter(Boolean) || [],
  };
}
