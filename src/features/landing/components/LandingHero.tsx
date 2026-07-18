import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "./DashboardMockup";

export function LandingHero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden text-center text-[hsl(var(--ll-text-on-dark))]"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, hsla(167, 90%, 48%, 0.12), transparent 34%), linear-gradient(135deg, hsl(var(--ll-navy-950)) 0%, hsl(var(--ll-navy-900)) 56%, hsl(var(--ll-navy-800)) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.72), transparent 78%)",
        }}
      />

      <div className="ll-container relative z-10 px-0 pb-16 pt-16 sm:pb-20 sm:pt-20 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-[820px] animate-fade-up">
          <p className="ll-eyebrow">Plataforma de stock y trazabilidad</p>
          <h1 className="ll-title text-[clamp(2.5rem,6vw,5.2rem)] text-white">
            <span className="text-primary">Logi</span>Lock
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[clamp(1rem,1.6vw,1.22rem)] leading-relaxed text-[hsl(var(--ll-text-muted-on-dark))]">
            Stock, trazabilidad y acceso inteligente en una única plataforma.
          </p>
          <div className="mt-8 flex flex-wrap items-stretch justify-center gap-3.5 sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/login">Entrar a la plataforma</Link>
            </Button>
            <Button asChild variant="ghostDark" size="lg" className="w-full sm:w-auto">
              <a href="#capacidades">Ver capacidades</a>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-[860px] animate-fade-up [animation-delay:120ms] sm:mt-14">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
