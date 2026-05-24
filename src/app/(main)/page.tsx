import HeroSection from "@/components/hero-section";
import LatestPosts from "@/components/latest-posts";
import SnippetsCarousel from "@/components/snippets-carousel";
import NewsletterSection from "@/components/newsletter-section";
import DsaSection from "@/components/dsa-section";
import { getFeaturedPost, getLatestPosts, getDsaPosts } from "@/lib/posts";
import { getAllSnippets } from "@/lib/snippets";
import { codeToHtml } from "shiki";

export default async function Home() {
  const featured = await getFeaturedPost();
  const latestPosts = await getLatestPosts();
  const snippets = await getAllSnippets();
  const dsaPosts = await getDsaPosts(5);
  
  const snippetsWithHtml = await Promise.all(
    snippets.slice(0, 6).map(async (snippet) => {
      let html = "";
      const codeSnippet = snippet.code.split("\n").slice(0, 7).join("\n");
      try {
        html = await codeToHtml(codeSnippet, {
          lang: snippet.languageSlug || snippet.language.toLowerCase(),
          theme: "one-dark-pro",
        });
      } catch (e) {
        try {
          html = await codeToHtml(codeSnippet, {
            lang: "text",
            theme: "one-dark-pro",
          });
        } catch (e2) {
          html = `<pre><code>${codeSnippet
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>`;
        }
      }
      return { ...snippet, html };
    })
  );

  return (
    <>
      {featured && <HeroSection featured={featured} />}
      <LatestPosts posts={latestPosts} />
      <SnippetsCarousel snippets={snippetsWithHtml} />
      <DsaSection posts={dsaPosts} />
      <NewsletterSection />
    </>
  );
}