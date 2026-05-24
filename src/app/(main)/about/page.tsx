import AboutHero from "@/components/about-hero";
import ProjectsSection from "@/components/projects-section";


export const metadata = {
  title: "About",
  description: "Vài dòng về bản thân và những gì mình đang tập trung.",
};

export default function AboutPage() {
  return (
    <div className="pt-12">
      <AboutHero />
      <ProjectsSection />
    </div>
  );
}