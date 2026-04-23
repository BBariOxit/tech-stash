export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  thumbnail: string;
  readTime: string;
  featured?: boolean;
  content?: string;
}

import { dummyPosts } from "@/data";

export const posts: Post[] = dummyPosts;

export function getFeaturedPost(): Post {
  return posts.find((p) => p.featured) ?? posts[0];
}

export function getLatestPosts(exclude?: string): Post[] {
  return posts.filter((p) => p.slug !== exclude).slice(0, 6);
}
