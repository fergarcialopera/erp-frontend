const STEPS = [
  {
    n: "01",
    title: "Identifica la clínica",
    text: "Selecciona tu centro y valida el acceso de la organización.",
  },
  {
    n: "02",
    title: "Entra como personal",
    text: "Elige tu perfil y autentícate con PIN o contraseña.",
  },
  {
    n: "03",
    title: "Opera con trazabilidad",
    text: "Consulta stock, registra salidas y revisa el historial en un mismo lugar.",
  },
];

export function ProcessSteps() {
  return (
    <section id="producto" className="ll-section bg-card border-y border-border">
      <div className="ll-container">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="ll-eyebrow">Flujo de acceso</p>
          <h2 className="ll-title text-[clamp(1.75rem,3.5vw,2.75rem)] text-foreground">
            De la puerta al inventario en tres pasos
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step) => (
            <div key={step.n} className="text-center">
              <div className="mb-4 inline-grid h-14 w-14 place-items-center rounded-full bg-primary font-heading text-lg font-extrabold text-primary-foreground">
                {step.n}
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
