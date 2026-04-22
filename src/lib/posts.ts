export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  thumbnail: string;
  readTime: string;
  featured?: boolean;
}

export const posts: Post[] = [
  {
    slug: "hanh-trinh-cau-xe-vps-oracle",
    title: "Hành trình cấu xé với VPS Oracle và cái kết",
    excerpt:
      "Tưởng free là ngon, ai ngờ Oracle nó terminate instance không báo trước. Đây là toàn bộ drama và cách mình recover lại production.",
    date: "2025-04-18",
    tags: ["DevOps", "VPS", "Rant"],
    thumbnail: "/thumbnails/oracle-vps.jpg",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "nextjs-app-router-data-fetching",
    title: "Next.js App Router: Data Fetching patterns mày nên biết",
    excerpt:
      "Server Components, Suspense, parallel fetching — breakdown chi tiết cách xài đúng để không bị re-render điên loạn.",
    date: "2025-04-10",
    tags: ["Next.js", "React"],
    thumbnail: "/thumbnails/nextjs-data.jpg",
    readTime: "6 min read",
  },
  {
    slug: "supabase-rls-setup",
    title: "Cấu hình Supabase RLS đúng cách để không bị lộ data",
    excerpt:
      "Row Level Security là thứ mà 90% dev bỏ qua khi mới dùng Supabase. Đây là cách setup đúng từ đầu.",
    date: "2025-04-02",
    tags: ["Supabase", "Security"],
    thumbnail: "/thumbnails/supabase-rls.jpg",
    readTime: "5 min read",
  },
  {
    slug: "tailwind-v4-migration",
    title: "Migration từ Tailwind v3 sang v4: Cái gì thay đổi?",
    excerpt:
      "CSS-first config, @theme directive, không còn tailwind.config.ts — đây là những điểm mày cần chú ý khi nâng cấp.",
    date: "2025-03-25",
    tags: ["Tailwind", "CSS"],
    thumbnail: "/thumbnails/tailwind-v4.jpg",
    readTime: "4 min read",
  },
  {
    slug: "typescript-tips-2025",
    title: "5 TypeScript tips giúp code sạch hơn mà ít người biết",
    excerpt:
      "satisfies operator, template literal types, infer keyword — mấy cái này mình dùng hàng ngày mà ít thấy ai nhắc tới.",
    date: "2025-03-15",
    tags: ["TypeScript"],
    thumbnail: "/thumbnails/typescript-tips.jpg",
    readTime: "7 min read",
  },
  {
    slug: "docker-compose-dev-setup",
    title: "Docker Compose setup cho local dev environment chuẩn không cần chỉnh",
    excerpt:
      "Môi trường dev của mình: Next.js + Postgres + Redis + Mailhog, tất cả trong một docker-compose.yml.",
    date: "2025-03-05",
    tags: ["Docker", "DevOps"],
    thumbnail: "/thumbnails/docker-compose.jpg",
    readTime: "5 min read",
  },
];

export function getFeaturedPost(): Post {
  return posts.find((p) => p.featured) ?? posts[0];
}

export function getLatestPosts(exclude?: string): Post[] {
  return posts.filter((p) => p.slug !== exclude).slice(0, 6);
}
