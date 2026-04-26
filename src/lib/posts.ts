import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  thumbnail: string;
  reading_time: number;
  featured?: boolean;
  content?: string;
}

export async function getAllPosts(): Promise<Post[]> {
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
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data.map((post: any) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    date: post.created_at,
    tags: post.post_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
    thumbnail: post.thumbnail || "",
    reading_time: post.reading_time || 1,
    featured: post.featured,
    content: post.content,
  }));
}

export async function getFeaturedPost(): Promise<Post | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.featured) || posts[0] || null;
}

export async function getLatestPosts(excludeSlug?: string): Promise<Post[]> {
  const posts = await getAllPosts();
  const filtered = posts.filter((p) => p.slug !== excludeSlug);
  
  // Nếu filter xong không còn bài nào, lấy luôn bài bị exclude (để UI không bị trống)
  if (filtered.length === 0 && posts.length > 0) {
    return posts.slice(0, 6);
  }
  
  return filtered.slice(0, 6);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
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
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || "",
    date: data.created_at,
    tags: data.post_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
    thumbnail: data.thumbnail || "",
    reading_time: data.reading_time || 1,
    featured: data.featured,
    content: data.content,
  };
}
