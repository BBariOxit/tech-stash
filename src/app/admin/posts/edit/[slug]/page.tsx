import { getPostForEdit } from "@/app/admin/posts/actions";
import { CreatePostForm } from "@/components/admin/create-post-form";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết",
};

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const post = await getPostForEdit(slug);

  if (!post) {
    notFound();
  }

  const initialData = {
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    thumbnail: post.thumbnail || "",
    language_id: post.language_id || "",
    content: post.content || "",
    published: post.published || false,
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Pencil className="w-5 h-5 text-cyan-400" />
            Chỉnh sửa bài viết
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Đang chỉnh sửa bài viết: <strong className="text-zinc-300">{post.title}</strong>
          </p>
        </div>
      </div>

      <CreatePostForm
        initialData={initialData}
        initialTags={post.tags}
        postId={post.id}
        isEditMode={true}
      />
    </div>
  );
}
