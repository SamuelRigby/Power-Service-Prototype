import { CapabilitiesSection } from "@/components/CapabilitiesSection";
import { CtaBand } from "@/components/CtaBand";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LoadCurveDivider } from "@/components/LoadCurveDivider";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CapabilitiesSection />
        <LoadCurveDivider />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
