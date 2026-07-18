import { LandingHeader } from "./components/LandingHeader";
import { LandingHero } from "./components/LandingHero";
import { FeatureGrid } from "./components/FeatureGrid";
import { ProcessSteps } from "./components/ProcessSteps";
import { LandingCta } from "./components/LandingCta";
import { LandingFooter } from "./components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <LandingHero />
        <FeatureGrid />
        <ProcessSteps />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
