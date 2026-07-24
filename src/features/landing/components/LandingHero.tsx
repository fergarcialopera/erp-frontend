import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "./ContactDialog";

// TODO: sustituir por el número profesional de WhatsApp cuando esté disponible
const WHATSAPP_URL = "https://wa.me/34600000000";

const TRUSTED_BRANDS = [
  { name: "Dr Bloom", className: "font-serif italic text-lg" },
  { name: "KLINEA", className: "font-heading text-base font-extrabold tracking-[0.18em]" },
  { name: "medika+", className: "text-lg font-bold lowercase tracking-tight" },
  { name: "AXIOM LAB", className: "font-mono text-sm font-medium tracking-[0.12em]" },
  { name: "Ortavia", className: "font-serif text-lg font-light" },
  { name: "dentra.", className: "font-heading text-lg font-extrabold tracking-tight" },
  { name: "VELMED", className: "text-base font-semibold tracking-[0.28em]" },
  { name: "Sanovia", className: "font-serif italic text-lg font-semibold" },
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-[#25D366]">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function LandingHero() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section
      id="inicio"
      // Se extiende bajo el header sticky (77px) para que el traslúcido siempre se mezcle con el fondo oscuro
      className="relative -mt-[77px] overflow-hidden pt-[77px] text-center text-[hsl(var(--ll-text-on-dark))]"
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

      <div className="ll-container relative z-10 px-0 pt-14 sm:pt-16 md:pt-20">
        <div className="mx-auto max-w-[820px] animate-fade-up">
          <h1 className="ll-title mx-auto max-w-[640px] text-[clamp(2.4rem,5.2vw,4.2rem)] text-white">
            Control absoluto de tu stock
          </h1>
          <p className="mx-auto mt-6 max-w-[620px] text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-[hsl(var(--ll-text-muted-on-dark))]">
            La única plataforma que combina taquillas inteligentes y software en la nube para
            automatizar tu trazabilidad, evitar pérdidas y recibir alertas de stock bajo al
            instante.
          </p>
          <div className="mt-8 flex flex-wrap items-stretch justify-center gap-3.5 sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setContactOpen(true)}
            >
              Consigue una prueba
            </Button>
            <Button asChild variant="ghostDark" size="lg" className="w-full sm:w-auto">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Envíanos un WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-[920px] animate-fade-up [animation-delay:120ms] sm:mt-14">
          <div className="overflow-hidden rounded-2xl border border-white/16 bg-white/95 p-2 shadow-hero sm:p-2.5">
            <img
              src="/landing/hero-dashboard.png"
              alt="Panel de LogiLock con el inventario en tiempo real: métricas, stock por ubicación y movimientos"
              className="h-auto w-full rounded-xl"
              width={1024}
              height={683}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-14 sm:mt-16">
        <p className="mb-6 text-center text-sm text-[hsl(var(--ll-text-muted-on-dark))]">
          Cada vez más clientes confían en LogiLock
        </p>
        <div className="border-t border-white/5 bg-black/30 py-7">
          <div className="ll-container flex flex-wrap items-center justify-center gap-x-10 gap-y-5 lg:justify-between">
            {TRUSTED_BRANDS.map((brand) => (
              <span
                key={brand.name}
                className={`whitespace-nowrap text-white/55 ${brand.className}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
}
