import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: { default: "Admin — Tech Stash", template: "%s | Admin" },
  description: "Trang quản trị nội dung Tech Stash",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
