const SOLUTIONS = [
  {
    image: "/landing/solutions-clinics.png",
    alt: "Farmacéutica revisando el inventario de su clínica con una tablet",
    title: "Pymes y clínicas independientes",
    lead: "Cero pérdidas de inventario:",
    text: "elimina el desperdicio de material, automatiza el seguimiento diario y mantén tu negocio bajo presupuesto.",
  },
  {
    image: "/landing/solutions-enterprise.png",
    alt: "Responsable de centro consultando el dashboard multi-sede de LogiLock",
    title: "Redes de centros y grandes empresas",
    lead: "Control multi-sede:",
    text: "escala en diferentes ubicaciones, intégralo con tu ERP y aplica accesos de usuario seguros.",
  },
];

export function SolutionsSection() {
  return (
    <section className="ll-section ll-section-dark">
      <div className="ll-container">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="ll-title text-[clamp(1.75rem,3.2vw,2.4rem)] text-white">
            La solución ideal para tu negocio
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-10">
          {SOLUTIONS.map((solution, index) => (
            <div
              key={solution.title}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <img
                src={solution.image}
                alt={solution.alt}
                className="aspect-[4/3] w-full rounded-2xl object-cover"
                width={1024}
                height={768}
                loading="lazy"
              />
              <h3 className="mt-6 font-heading text-[1.35rem] font-bold tracking-tight text-white">
                {solution.title}
              </h3>
              <p className="mt-2.5 max-w-[480px] leading-relaxed text-[hsl(var(--ll-text-muted-on-dark))]">
                <strong className="font-semibold text-primary">{solution.lead}</strong>{" "}
                {solution.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
