import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import LatestPosts from "@/components/latest-posts";
import SnippetsCarousel from "@/components/snippets-carousel";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";
import { getFeaturedPost, getLatestPosts } from "@/lib/posts";
import { snippets } from "@/lib/snippets";

export default async function Home() {
  const featured = await getFeaturedPost();
  const latestPosts = await getLatestPosts();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {featured && <HeroSection featured={featured} />}
        <LatestPosts posts={latestPosts} />
        <SnippetsCarousel snippets={snippets} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}