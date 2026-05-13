import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutHero from "@/components/about-hero";

export const metadata = {
  title: "About",
  description: "Vài dòng về bản thân và những gì mình đang tập trung.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-12 pb-24">
        <AboutHero />
      </main>
      <Footer />
    </>
  );
}