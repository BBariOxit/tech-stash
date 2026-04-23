import { getAllSnippets } from "@/lib/snippets-mdx";
import { SnippetsClient } from "./SnippetsClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Snippets | Tech Stash",
  description: "Kho lưu trữ code snippets tiện ích.",
};

export default function SnippetsPage() {
  const snippets = getAllSnippets();

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Code Stash
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Snippets
            </h1>
            <p className="text-zinc-400 max-w-2xl text-lg">
              Những đoạn code hay dùng, copy paste ăn ngay. 
              Tối ưu hóa thời gian dev để còn đi chơi.
            </p>
          </div>

          <SnippetsClient snippets={snippets} />
        </div>
      </main>
      <Footer />
    </>
  );
}
