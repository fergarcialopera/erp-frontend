import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="bg-navy-950 pb-7 pt-16 text-[hsl(var(--ll-text-muted-on-dark))]">
      <div className="ll-container">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-start md:justify-between">
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
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Stock, trazabilidad y acceso inteligente en una única plataforma.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a href="#producto" className="transition-colors hover:text-white">
              Producto
            </a>
            <a href="#capacidades" className="transition-colors hover:text-white">
              Capacidades
            </a>
            <Link to="/login" className="transition-colors hover:text-white">
              Acceso
            </Link>
            <Link to="/recover" className="transition-colors hover:text-white">
              Recuperación
            </Link>
          </div>
        </div>

        <p className="pt-7 text-center text-[11px] md:text-left">
          © {new Date().getFullYear()} LogiLock · Sistema interno · Acceso restringido
        </p>
      </div>
    </footer>
  );
}
