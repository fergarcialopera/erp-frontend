import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section id="acceso" className="ll-section bg-background">
      <div className="ll-container">
        <div
          className="rounded-3xl px-6 py-10 text-center shadow-soft sm:px-10 sm:py-14 md:px-16"
          style={{
            background:
              "radial-gradient(circle at 86% 16%, hsla(167, 90%, 48%, 0.16), transparent 30%), linear-gradient(135deg, hsl(var(--ll-navy-950)), hsl(var(--ll-navy-900)))",
            color: "hsl(var(--ll-text-on-dark))",
          }}
        >
          <p className="ll-eyebrow">Acceso restringido</p>
          <h2 className="ll-title mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,2.75rem)] text-white">
            Listo para operar con control y claridad
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[hsl(var(--ll-text-muted-on-dark))]">
            Sistema interno para clínicas y equipos autorizados. Entra con tus credenciales de
            organización.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/login">Ir al acceso</Link>
            </Button>
            <Button asChild variant="ghostDark" size="lg" className="w-full sm:w-auto">
              <Link to="/recover">Recuperar credenciales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
