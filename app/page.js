import React from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FaqSection";
import CTASection from "@/components/CtaSection";
import Newsletter from "@/components/NewsLetter";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <AdvantagesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Newsletter />
    </main>
  );
};

export default LandingPage;




