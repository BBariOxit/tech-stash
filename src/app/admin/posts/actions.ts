"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../../types/supabase";
import { revalidatePath } from "next/cache";

// Anonymous client for reading (bypasses RLS cookie issues)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  published: boolean;
  featured: boolean;
  reading_time: number | null;
  created_at: string;
  tags: string[];
};

// ── Fetch all posts for admin ──────────────────────────
export async function getAdminPosts(): Promise<AdminPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      post_tags (
        tags (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminPosts] Error:", error.message, error.details, error.hint);
    return [];
  }

  return (data ?? []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    published: post.published,
    featured: post.featured ?? false,
    reading_time: post.reading_time,
    created_at: post.created_at,
    tags: Array.isArray(post.post_tags)
      ? post.post_tags
          .map((pt: any) => {
            // tags có thể là object {name} hoặc array [{name}]
            if (!pt.tags) return null;
            if (Array.isArray(pt.tags)) return pt.tags[0]?.name ?? null;
            return pt.tags.name ?? null;
          })
          .filter(Boolean)
      : [],
  }));
}

// ── Toggle publish status ──────────────────────────────
export async function togglePostPublished(
  id: string,
  published: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("posts")
    .update({ published })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true };
}

// ── Toggle featured status ─────────────────────────────
export async function togglePostFeatured(
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // Nếu đang set featured = true, bỏ featured của tất cả bài khác trước
  if (featured) {
    await supabase
      .from("posts")
      .update({ featured: false })
      .neq("id", id);
  }

  const { error } = await supabase
    .from("posts")
    .update({ featured })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true };
}

// ── Delete post ────────────────────────────────────────
export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // Xóa liên kết post_tags trước
  const { error: linkError } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", id);

  if (linkError) {
    return { success: false, error: linkError.message };
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true };
}
