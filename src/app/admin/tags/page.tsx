import { getTags } from "@/app/admin/tags/actions";
import { TagsManagement } from "@/components/admin/tags-management";
import { Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Tags",
};

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Tag className="w-5 h-5 text-primary" />
          Quản lý Tags
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tạo, sửa, xoá tags. Tags được gắn vào posts qua bảng{" "}
          <code className="text-primary/80 text-xs bg-primary/5 px-1.5 py-0.5 rounded">
            post_tags
          </code>{" "}
          trên Supabase.
        </p>
      </div>

      <TagsManagement initialTags={tags} />
    </div>
  );
}
