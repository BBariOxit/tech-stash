"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "../../../../types/supabase";

export type TagWithCount = Tables<"tags"> & { post_count: number };

// ── Fetch all tags with post count ─────────────────────
export async function getTags(): Promise<TagWithCount[]> {
  const supabase = await createClient();

  // Fetch tags + all post_tags to compute counts in parallel
  const [{ data: tags, error: tagsError }, { data: postTags, error: postTagsError }] = await Promise.all([
    supabase.from("tags").select("*").order("name"),
    supabase.from("post_tags").select("tag_id"),
  ]);

  if (tagsError) {
    console.error("[getTags] tags error:", tagsError);
    return [];
  }

  if (postTagsError) {
    console.error("[getTags] post_tags error:", postTagsError);
  }

  // Compute per-tag count
  const counts: Record<string, number> = {};
  for (const row of postTags ?? []) {
    counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1;
  }

  return (tags ?? []).map((t) => ({
    ...t,
    post_count: counts[t.id] ?? 0,
  }));
}

// ── Create tag ─────────────────────────────────────────
export async function createTag(data: {
  name: string;
  slug: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("tags").insert({
    name: data.name.trim(),
    slug: data.slug.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tag hoặc slug này đã tồn tại rồi." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { success: true };
}

// ── Update tag ─────────────────────────────────────────
export async function updateTag(
  id: string,
  data: { name: string; slug: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tags")
    .update({ name: data.name.trim(), slug: data.slug.trim() })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tên hoặc slug đã tồn tại." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { success: true };
}

// ── Delete tag ─────────────────────────────────────────
export async function deleteTag(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Cascade: delete post_tags first to avoid FK constraint
  const { error: linkError } = await supabase
    .from("post_tags")
    .delete()
    .eq("tag_id", id);

  if (linkError) {
    return { success: false, error: linkError.message };
  }

  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/tags");
  return { success: true };
}
