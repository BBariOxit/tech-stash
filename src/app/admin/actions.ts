"use server";

import { createClient } from "@/lib/supabase/server";
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
  content: string;
  language: string;
  published: boolean;
  tagIds: string[];
}): Promise<CreatePostState> {
  const supabase = await createClient();

  // Hardcoded author_id — đây là admin tạm, sau sẽ lấy từ session
  const ADMIN_AUTHOR_ID = process.env.ADMIN_AUTHOR_ID ?? "00000000-0000-0000-0000-000000000000";

  // 1. Insert post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      published: data.published,
      featured: false,
      author_id: ADMIN_AUTHOR_ID,
    })
    .select("id")
    .single();

  if (postError) {
    console.error("Post insert error:", postError);
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
