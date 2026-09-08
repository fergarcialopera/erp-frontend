import { Sparkles, LockKeyhole, CloudUpload } from "lucide-react";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Registro Automatizado",
    text: "Cada entrada y salida se vincula al instante con la identidad del empleado responsable.",
  },
  {
    icon: LockKeyhole,
    title: "Control de acceso",
    text: "Protege tus productos de alto valor limitando su apertura solo a perfiles autorizados.",
  },
  {
    icon: CloudUpload,
    title: "Operaciones sin papel",
    text: "Automatiza el registro de movimientos en la nube y dile adiós a las hojas de control manuales.",
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="ll-section bg-background">
      <div className="ll-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-up">
          <img
            src="/landing/benefits-notifications.png"
            alt="Notificaciones de LogiLock y formulario de registro de salida de producto"
            className="h-auto w-full rounded-2xl"
            width={1024}
            height={683}
            loading="lazy"
          />
        </div>

        <div className="animate-fade-up [animation-delay:100ms]">
          <h2 className="ll-title text-[clamp(1.9rem,3.5vw,2.75rem)] text-foreground">
            Trazabilidad automatizada. Cero pérdidas inexplicables.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            LogiLock une{" "}
            <strong className="font-semibold text-foreground">seguridad física inteligente</strong>{" "}
            y trazabilidad en la nube. Sabrás al instante{" "}
            <strong className="font-semibold text-foreground">quién, cuándo y qué se retira</strong>
            , eliminando el descontrol de tu stock.
          </p>

          <ul className="mt-8 space-y-7 border-t border-border pt-8">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.title} className="flex items-start gap-4">
                  <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsla(167,90%,48%,0.12)] text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="font-heading text-[1.05rem] font-bold tracking-tight text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {benefit.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
