import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, syncProfileFromAuth } from "@/lib/supabase/profiles";

export const metadata: Metadata = {
  title: { default: "Admin — Tech Stash", template: "%s | Admin" },
  description: "Trang quản trị nội dung Tech Stash",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  try {
    await syncProfileFromAuth(user);
    const role = await getUserRole(user.id);

    if (role !== "admin") {
      redirect("/");
    }
  } catch (error) {
    console.error("[admin/layout] Failed to validate admin role", error);
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      {/* Main scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      <Toaster
        theme="dark"
        richColors
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fafafa",
          },
        }}
      />
    </div>
  );
}
