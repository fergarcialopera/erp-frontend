import { LandingHeader } from "./components/LandingHeader";
import { LandingHero } from "./components/LandingHero";
import { BenefitsSection } from "./components/BenefitsSection";
import { AdvantagesSection } from "./components/AdvantagesSection";
import { SoftwareSection } from "./components/SoftwareSection";
import { SolutionsSection } from "./components/SolutionsSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LandingFooter } from "./components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <LandingHero />
        <BenefitsSection />
        <AdvantagesSection />
        <SoftwareSection />
        <SolutionsSection />
        <HowItWorksSection />
      </main>
      <LandingFooter />
    </div>
  );
}
