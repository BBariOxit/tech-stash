import type { Metadata } from "next";
import { Roboto, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "tech-stash — Thai Bao's Dev Blog",
    template: "%s | tech-stash",
  },
  description:
    "Kho lưu trữ kiến thức, code snippets, và những bài viết thực chiến về Web Development, DevOps, và thứ linh tinh khác của Thai Bao.",
  keywords: ["Next.js", "TypeScript", "DevOps", "Web Development", "Blog"],
  authors: [{ name: "Thai Bao" }],
  creator: "Thai Bao",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "tech-stash",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      // Force dark mode permanently — no toggle, no localStorage
      className={`dark ${roboto.variable} ${geistMono.variable} ${jbMono.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
