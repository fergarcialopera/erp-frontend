import { useState } from "react";
import { Users, Layers, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "./ContactDialog";

const STEPS = [
  {
    icon: Users,
    title: "1. Identifica al usuario",
    text: "Acceso mediante PIN o sistema de autenticación.",
  },
  {
    icon: Layers,
    title: "2. Retira o registra material",
    text: "Cada movimiento queda registrado automáticamente.",
  },
  {
    icon: RefreshCw,
    title: "3. Automatiza Stock",
    text: "Consulta el estado de tus productos en tiempo real desde tu móvil o PC.",
  },
];

export function HowItWorksSection() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="como-funciona" className="ll-section bg-background">
      <div className="ll-container">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="ll-title text-[clamp(1.75rem,3.2vw,2.4rem)] text-foreground">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            Gestiona y controla{" "}
            <strong className="font-semibold text-foreground">
              medicamentos, consumibles, material clínico, equipamiento y tus productos
            </strong>{" "}
            de múltiples sedes desde una{" "}
            <strong className="font-semibold text-foreground">única plataforma</strong>.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="animate-fade-up text-center"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="mb-4 inline-grid h-14 w-14 place-items-center rounded-full bg-warning text-navy-950">
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </div>
                <h3 className="font-heading text-[1.02rem] font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-14 overflow-hidden rounded-3xl px-6 py-10 shadow-soft sm:px-10 sm:py-12 md:mt-20 md:px-14"
          style={{
            background:
              "radial-gradient(circle at 82% 18%, hsla(167, 90%, 48%, 0.14), transparent 34%), linear-gradient(135deg, hsl(var(--ll-navy-950)), hsl(var(--ll-navy-900)))",
            color: "hsl(var(--ll-text-on-dark))",
          }}
        >
          <div className="inline-flex items-center gap-2.5 text-white">
            <img
              src="/favicon/favicon.svg"
              alt=""
              className="h-8 w-8"
              width={32}
              height={32}
            />
            <span className="font-heading text-lg font-bold tracking-[-0.04em]">
              <span className="text-primary">Logi</span>
              Lock
            </span>
          </div>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="ll-title max-w-[460px] text-[clamp(1.6rem,3vw,2.3rem)] text-white">
                Centraliza <span className="text-primary">todo</span> tu stock con un único
                software.
              </h3>
              <p className="mt-4 max-w-[440px] leading-relaxed text-[hsl(var(--ll-text-muted-on-dark))]">
                Automatiza la trazabilidad de tus productos, elimina las mermas y toma mejores
                decisiones de compra.
              </p>
              <Button
                variant="onDark"
                size="lg"
                className="mt-7 w-full sm:w-auto"
                onClick={() => setContactOpen(true)}
              >
                Solicitar Demo
                <ArrowRight />
              </Button>
            </div>

            <img
              src="/landing/cta-screens.png"
              alt="Pantallas del software de inventario de LogiLock con métricas y gráficos"
              className="h-auto w-full"
              width={1024}
              height={768}
              loading="lazy"
              style={{
                maskImage:
                  "radial-gradient(ellipse 78% 78% at 50% 50%, black 58%, transparent 96%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 78% 78% at 50% 50%, black 58%, transparent 96%)",
              }}
            />
          </div>
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
}
