import { useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TryOnSection from "@/components/TryOnSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const scrollToTryOn = useCallback(() => {
    const element = document.getElementById("try-on");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onTryOn={scrollToTryOn} />
      <HeroSection onGetStarted={scrollToTryOn} />
      <TryOnSection id="try-on" />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
