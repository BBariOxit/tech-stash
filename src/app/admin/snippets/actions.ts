"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────
export type AdminSnippet = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  code: string;
  filename: string | null;
  language_id: string | null;
  language?: { id: string; name: string; slug: string } | null;
  published: boolean;
  created_at: string;
  updated_at: string | null;
  tags: { id: string; name: string; slug: string }[];
};

// ── Fetch all snippets for admin ───────────────────────
export async function getAdminSnippets(): Promise<AdminSnippet[]> {
  const supabase = await createServerClient();

    const { data, error } = await supabase
    .from("snippets")
    .select(`
      *,
      languages (
        id,
        name,
        slug
      ),
      snippet_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminSnippets] Error:", error.message, error.details, error.hint);
    return [];
  }

  return (data ?? []).map((snippet: any) => ({
    id: snippet.id,
    title: snippet.title,
    slug: snippet.slug,
    description: snippet.description,
    code: snippet.code,
    filename: snippet.filename,
    language_id: snippet.language_id,
    language: snippet.languages ? (Array.isArray(snippet.languages) ? snippet.languages[0] : snippet.languages) : null,
    published: snippet.published ?? false,
    created_at: snippet.created_at,
    updated_at: snippet.updated_at,
    tags: Array.isArray(snippet.snippet_tags)
      ? snippet.snippet_tags
          .map((st: any) => {
            if (!st.tags) return null;
            if (Array.isArray(st.tags)) return st.tags[0] ?? null;
            return st.tags;
          })
          .filter(Boolean)
      : [],
  }));
}

// ── Create snippet ─────────────────────────────────────
export async function createSnippet(data: {
  title: string;
  slug: string;
  description: string;
  code: string;
  filename: string;
  language_id: string;
  published: boolean;
  tagIds: string[];
}): Promise<{ success: boolean; error?: string; snippetId?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Bạn cần đăng nhập trước." };
  }

  // 1. Insert snippet
  const { data: snippet, error: snippetError } = await supabase
    .from("snippets")
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      code: data.code,
      filename: data.filename || "snippet.ts",
      language_id: data.language_id,
      published: data.published,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (snippetError) {
    console.error("[createSnippet] Insert failed:", snippetError);
    if (snippetError.code === "23505") {
      return { success: false, error: "Slug này đã tồn tại, hãy chọn slug khác." };
    }
    return { success: false, error: snippetError.message };
  }

  // 2. Link tags (snippet_tags)
  if (data.tagIds.length > 0) {
    const tagLinks = data.tagIds.map((tag_id) => ({
      snippet_id: snippet.id,
      tag_id,
    }));

    const { error: tagError } = await supabase.from("snippet_tags").insert(tagLinks);

    if (tagError) {
      // Rollback snippet if tag linking fails
      await supabase.from("snippets").delete().eq("id", snippet.id);
      console.error("[createSnippet] Tag link error:", tagError);
      return { success: false, error: "Lỗi khi gắn tags: " + tagError.message };
    }
  }

  revalidatePath("/admin/snippets");
  revalidatePath("/snippets");

  return { success: true, snippetId: snippet.id };
}

// ── Update snippet ─────────────────────────────────────
export async function updateSnippet(
  id: string,
  data: {
    title: string;
    slug: string;
    description: string;
    code: string;
    filename: string;
    language_id: string;
    published: boolean;
    tagIds: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { error: updateError } = await supabase
    .from("snippets")
    .update({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      code: data.code,
      filename: data.filename || "snippet.ts",
      language_id: data.language_id,
      published: data.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("[updateSnippet] Update failed:", updateError);
    if (updateError.code === "23505") {
      return { success: false, error: "Slug này đã tồn tại." };
    }
    return { success: false, error: updateError.message };
  }

  // Re-link tags: delete old, insert new
  const { error: delTagError } = await supabase
    .from("snippet_tags")
    .delete()
    .eq("snippet_id", id);

  if (delTagError) {
    console.error("[updateSnippet] Delete old tags failed:", delTagError);
    return { success: false, error: delTagError.message };
  }

  if (data.tagIds.length > 0) {
    const tagLinks = data.tagIds.map((tag_id) => ({
      snippet_id: id,
      tag_id,
    }));

    const { error: tagError } = await supabase.from("snippet_tags").insert(tagLinks);

    if (tagError) {
      console.error("[updateSnippet] Tag link error:", tagError);
      return { success: false, error: "Lỗi khi gắn tags: " + tagError.message };
    }
  }

  revalidatePath("/admin/snippets");
  revalidatePath("/snippets");

  return { success: true };
}

// ── Toggle publish status ──────────────────────────────
export async function toggleSnippetPublished(
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("snippets")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/snippets");
  revalidatePath("/snippets");
  return { success: true };
}

// ── Delete snippet ─────────────────────────────────────
export async function deleteSnippet(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // Delete snippet_tags first to avoid FK constraint
  const { error: linkError } = await supabase
    .from("snippet_tags")
    .delete()
    .eq("snippet_id", id);

  if (linkError) {
    return { success: false, error: linkError.message };
  }

  const { error } = await supabase.from("snippets").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/snippets");
  revalidatePath("/snippets");
  return { success: true };
}
