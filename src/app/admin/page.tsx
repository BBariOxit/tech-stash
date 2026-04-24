import { CreatePostForm } from "@/components/admin/create-post-form";
import { PlusCircle } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-primary" />
            Tạo Post mới
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Điền thông tin và nội dung bên dưới. Submit xong sẽ thấy ngay trên Supabase.
          </p>
        </div>
      </div>

      <CreatePostForm />
    </div>
  );
}
