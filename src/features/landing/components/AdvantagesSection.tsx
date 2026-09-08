import { useState } from "react";
import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "./ContactDialog";

const ADVANTAGES = [
  "Reducción inmediata de mermas.",
  "Sincronización y trazabilidad en tiempo real.",
  "Eliminación de registros manuales.",
  "Alertas de stock bajo automáticas.",
  "Optimización de compras basada en datos.",
];

export function AdvantagesSection() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="ll-section ll-section-dark">
      <div className="ll-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-up">
          <h2 className="ll-title max-w-[520px] text-[clamp(1.9rem,3.5vw,2.75rem)] text-white">
            Ventajas operativas de trabajar con LogiLock
          </h2>
          <p className="mt-5 max-w-[520px] leading-relaxed text-[hsl(var(--ll-text-muted-on-dark))]">
            Automatiza el control de tus materiales más valiosos, reduce mermas y libera a tu
            equipo de tareas manuales.
          </p>

          <ul className="mt-8 space-y-4">
            {ADVANTAGES.map((advantage) => (
              <li key={advantage} className="flex items-center gap-3">
                <Sparkle
                  className="h-4 w-4 shrink-0 text-warning"
                  fill="currentColor"
                  aria-hidden
                />
                <span className="text-[0.98rem] font-semibold text-white">{advantage}</span>
              </li>
            ))}
          </ul>

          <Button
            variant="onDark"
            size="lg"
            className="mt-9 w-full sm:w-auto"
            onClick={() => setContactOpen(true)}
          >
            Consigue una prueba
          </Button>
        </div>

        <div className="relative animate-fade-up [animation-delay:100ms] lg:order-last">
          <div
            className="pointer-events-none absolute -left-4 -top-4 h-28 w-28 rounded-tl-[40px] border-l-[10px] border-t-[10px] border-primary"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 rounded-br-[40px] border-b-[10px] border-r-[10px] border-primary"
            aria-hidden
          />
          <img
            src="/landing/advantages-person.png"
            alt="Profesional sanitario consultando el dashboard de inventario de LogiLock en su ordenador"
            className="relative h-auto w-full rounded-2xl"
            width={1024}
            height={768}
            loading="lazy"
          />
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
}
