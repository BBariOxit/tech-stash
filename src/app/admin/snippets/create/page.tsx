import { CreateSnippetForm } from "@/components/admin/create-snippet-form";
import { Code2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo Snippet",
};

export default function CreateSnippetPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-primary" />
            Tạo Snippet mới
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Điền thông tin và code bên dưới. Snippet sẽ được lưu trực tiếp vào Supabase.
          </p>
        </div>
      </div>

      <CreateSnippetForm />
    </div>
  );
}
