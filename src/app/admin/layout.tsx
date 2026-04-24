import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Admin — Tech Stash",
  description: "Trang quản trị nội dung Tech Stash",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
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
    </>
  );
}
