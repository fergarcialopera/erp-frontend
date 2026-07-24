import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#software", label: "Software" },
  { href: "#como-funciona", label: "Cómo funciona" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-[18px]">
      <nav className="ll-container flex min-h-[76px] items-center justify-between gap-6 md:grid md:grid-cols-[1fr_auto_1fr]">
        <a href="#inicio" className="inline-flex items-center gap-2.5 justify-self-start text-white">
          <img
            src="/favicon/favicon.svg"
            alt=""
            className="h-[34px] w-[34px]"
            width={34}
            height={34}
          />
          <span className="font-heading text-xl font-bold tracking-[-0.04em]">
            <span className="text-primary">Logi</span>
            <span>Lock</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 text-[0.92rem] font-medium text-[hsl(var(--ll-text-muted-on-dark))] md:flex lg:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-[180ms] hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 justify-self-end">
          <Button asChild variant="ghostDark" size="sm">
            <Link to="/login">Acceder</Link>
          </Button>
          <Button asChild variant="onDark" size="sm">
            <a href="#contacto">Contacto</a>
          </Button>
        </div>
      </nav>
    </header>
  );
}
