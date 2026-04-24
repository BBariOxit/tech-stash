"use server";

import { createClient } from "@/lib/supabase/server";
import { syncAuthenticatedUserProfile } from "@/lib/supabase/user-profile";
import { revalidatePath } from "next/cache";

export type CreatePostState = {
  success: boolean;
  error?: string;
  postId?: string;
};

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  content: string;
  language: string;
  published: boolean;
  tagIds: string[];
}): Promise<CreatePostState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Bạn cần đăng nhập trước khi tạo bài viết." };
  }

  try {
    await syncAuthenticatedUserProfile(user);
  } catch (error) {
    console.error("[createPost] Failed to sync profile", error);
    return { success: false, error: "Không thể đồng bộ profile người dùng." };
  }

  // 1. Insert post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      thumbnail: data.thumbnail || null,
      content: data.content,
      language: data.language,
      published: data.published,
      featured: false,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (postError) {
    console.error("[createPost] Post insert failed:", postError);
    if (postError.code === "23503") {
      return { success: false, error: "Lỗi tác giả: author_id không tồn tại trong hệ thống." };
    }
    if (postError.code === "23505") {
      return { success: false, error: "Slug này đã tồn tại, hãy chọn slug khác." };
    }
    return { success: false, error: postError.message };
  }

  // 2. Link tags (post_tags)
  if (data.tagIds.length > 0) {
    const tagLinks = data.tagIds.map((tag_id) => ({
      post_id: post.id,
      tag_id,
    }));

    const { error: tagError } = await supabase.from("post_tags").insert(tagLinks);

    if (tagError) {
      // Rollback post if tag linking fails
      await supabase.from("posts").delete().eq("id", post.id);
      console.error("Tag link error:", tagError);
      return { success: false, error: "Lỗi khi gắn tags: " + tagError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/blog");

  return { success: true, postId: post.id };
}

export async function getLanguages(): Promise<string[]> {
  return [
    "TypeScript",
    "JavaScript",
    "CSS",
    "HTML",
    "Bash",
    "Python",
    "Go",
    "Rust",
    "JSON",
    "YAML",
    "SQL",
    "Markdown",
    "Other",
  ];
}
