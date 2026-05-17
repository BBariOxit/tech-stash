"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../../types/supabase";
import { revalidatePath } from "next/cache";
import { getUserRole, syncProfileFromAuth } from "@/lib/supabase/profiles";
import { CreatePostState } from "@/app/admin/actions";

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

export async function updatePost(
  postId: string,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string;
    content: string;
    language_id: string;
    published: boolean;
    tagIds: string[];
    reading_time: number;
  }
): Promise<CreatePostState> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Bạn cần đăng nhập trước khi sửa bài viết." };
  }

  try {
    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return { success: false, error: "Bạn không có quyền sửa bài viết." };
    }
  } catch (error) {
    console.error("[updatePost] Failed to validate role", error);
    return { success: false, error: "Không thể xác thực quyền người dùng." };
  }

  let languageName = "Other";
  if (data.language_id) {
    const { data: lang } = await supabase
      .from("languages")
      .select("name")
      .eq("id", data.language_id)
      .single();
    if (lang?.name) languageName = lang.name;
  }

  // 1. Update post
  const { error: postError } = await supabase
    .from("posts")
    .update({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      thumbnail: data.thumbnail || null,
      content: data.content,
      language: languageName,
      language_id: data.language_id,
      published: data.published,
      reading_time: data.reading_time,
    })
    .eq("id", postId);

  if (postError) {
    console.error("[updatePost] Post update failed:", postError);
    if (postError.code === "23505") {
      return { success: false, error: "Slug này đã tồn tại, hãy chọn slug khác." };
    }
    return { success: false, error: postError.message };
  }

  // 2. Update tags: delete old ones, insert new ones
  await supabase.from("post_tags").delete().eq("post_id", postId);
  
  if (data.tagIds.length > 0) {
    const tagLinks = data.tagIds.map((tag_id) => ({
      post_id: postId,
      tag_id,
    }));

    const { error: tagError } = await supabase.from("post_tags").insert(tagLinks);
    if (tagError) {
      console.error("Tag link error:", tagError);
      return { success: false, error: "Lỗi khi cập nhật tags: " + tagError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  revalidatePath(`/blog/${data.slug}`);

  return { success: true, postId };
}

export async function getPostForEdit(slug: string) {
  const supabase = await createServerClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      post_tags (
        tags (*)
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !post) {
    return null;
  }

  const tags = Array.isArray(post.post_tags)
    ? post.post_tags
        .map((pt: any) => (Array.isArray(pt.tags) ? pt.tags[0] : pt.tags))
        .filter(Boolean)
    : [];

  return { ...post, tags };
}
