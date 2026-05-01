import { getLanguages } from "@/app/admin/languages/actions";
import { LanguagesManagement } from "@/components/admin/languages-management";
import { Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Languages",
};

export default async function LanguagesPage() {
  const languages = await getLanguages();

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-primary" />
          Quản lý Languages
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tạo, sửa, xoá ngôn ngữ. Ngôn ngữ được chọn làm ngôn ngữ chính để render syntax cho{" "}
          <code className="text-primary/80 text-xs bg-primary/5 px-1.5 py-0.5 rounded">
            snippets
          </code>{" "}
          và bài viết trên Supabase.
        </p>
      </div>

      <LanguagesManagement initialLanguages={languages} />
    </div>
  );
}
