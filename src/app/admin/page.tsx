import { CreatePostForm } from "@/components/admin/create-post-form";
import { Shield, LayoutDashboard, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                tech-stash
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-200 font-medium">Admin</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md text-primary bg-primary/10 border border-primary/20 font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Tạo Post mới
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              Tạo Post mới
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              Điền thông tin bên dưới. Sau khi Submit, nội dung sẽ xuất hiện trực tiếp trên Supabase.
            </p>
          </div>

          {/* Warning badge */}
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            Trang Admin — không phân quyền
          </div>
        </div>

        {/* Form */}
        <CreatePostForm />
      </main>
    </div>
  );
}
