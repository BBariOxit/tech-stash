import { getAdminPosts } from "@/app/admin/posts/actions";
import { PostsManagement } from "@/components/admin/posts-management";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Posts",
};

export default async function PostsPage() {
  const posts = await getAdminPosts();

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-primary" />
          Quản lý Posts
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Xem, tìm kiếm, đổi trạng thái và xóa bài viết. Bấm vào nút ba
          chấm để thao tác.
        </p>
      </div>

      <PostsManagement initialPosts={posts} />
    </div>
  );
}
