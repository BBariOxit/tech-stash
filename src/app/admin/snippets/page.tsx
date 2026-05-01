import { getAdminSnippets } from "@/app/admin/snippets/actions";
import { SnippetsManagement } from "@/components/admin/snippets-management";
import { LayoutList } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Snippets",
};

export default async function SnippetsPage() {
  const snippets = await getAdminSnippets();

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <LayoutList className="w-5 h-5 text-primary" />
          Quản lý Snippets
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Xem, tìm kiếm, đổi trạng thái và xóa snippet. Dữ liệu lưu trên bảng{" "}
          <code className="text-primary/80 text-xs bg-primary/5 px-1.5 py-0.5 rounded">
            snippets
          </code>{" "}
          và{" "}
          <code className="text-primary/80 text-xs bg-primary/5 px-1.5 py-0.5 rounded">
            snippet_tags
          </code>{" "}
          trên Supabase.
        </p>
      </div>

      <SnippetsManagement initialSnippets={snippets} />
    </div>
  );
}
