"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "../../../../types/supabase";

export type LanguageWithCount = Tables<"languages"> & { usage_count: number };

// ── Fetch all languages with usage count ─────────────────────
export async function getLanguages(): Promise<LanguageWithCount[]> {
  const supabase = await createClient();

  const [{ data: languages, error: langError }, { data: snippets, error: snippetsError }, { data: posts, error: postsError }] = await Promise.all([
    supabase.from("languages").select("*").order("name"),
    supabase.from("snippets").select("language_id"),
    supabase.from("posts").select("language_id"),
  ]);

  if (langError) {
    console.error("[getLanguages] languages error:", langError);
    return [];
  }

  // Compute per-language usage count
  const counts: Record<string, number> = {};
  for (const row of snippets ?? []) {
    if (row.language_id) {
      counts[row.language_id] = (counts[row.language_id] ?? 0) + 1;
    }
  }
  for (const row of posts ?? []) {
    if (row.language_id) {
      counts[row.language_id] = (counts[row.language_id] ?? 0) + 1;
    }
  }

  return (languages ?? []).map((l) => ({
    ...l,
    usage_count: counts[l.id] ?? 0,
  }));
}

// ── Create language ─────────────────────────────────────────
export async function createLanguage(data: {
  name: string;
  slug: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("languages").insert({
    name: data.name.trim(),
    slug: data.slug.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Ngôn ngữ hoặc slug này đã tồn tại rồi." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/languages");
  return { success: true };
}

// ── Update language ─────────────────────────────────────────
export async function updateLanguage(
  id: string,
  data: { name: string; slug: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("languages")
    .update({ name: data.name.trim(), slug: data.slug.trim() })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tên hoặc slug đã tồn tại." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/languages");
  return { success: true };
}

// ── Delete language ─────────────────────────────────────────
export async function deleteLanguage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Handle constraints by setting language_id to null for posts & snippets
  await Promise.all([
    supabase.from("posts").update({ language_id: null }).eq("language_id", id),
    supabase.from("snippets").update({ language_id: null }).eq("language_id", id),
  ]);

  const { error } = await supabase.from("languages").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/languages");
  return { success: true };
}
