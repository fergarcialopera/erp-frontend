// Los enlaces marcados con "#" son apartados aún sin definir; se completarán más adelante
const FOOTER_COLUMNS = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Equipo", href: "#" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  {
    title: "Producto",
    links: [
      { label: "Servicios", href: "#" },
      { label: "Precios", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Política de privacidad", href: "#" },
    ],
  },
  {
    title: "Síguenos",
    links: [
      { label: "Facebook", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-navy-950 pb-7 pt-16 text-[hsl(var(--ll-text-muted-on-dark))]">
      <div className="ll-container">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.3fr_repeat(4,1fr)] md:gap-8">
          <div>
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
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed">
              Creando soluciones digitales para tu negocio.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-heading text-sm font-bold tracking-tight text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="pt-7 text-[13px]">
          © {new Date().getFullYear()} LogiLock Quality Software
        </p>
      </div>
    </footer>
  );
}
