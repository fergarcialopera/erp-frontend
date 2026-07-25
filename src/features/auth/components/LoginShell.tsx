import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginShellProps {
  heading?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function LoginShell({
  heading,
  children,
  footer,
}: LoginShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="absolute left-4 top-4 text-muted-foreground hover:text-foreground sm:left-6 sm:top-6"
      >
        <Link to="/" aria-label="Volver a la página de inicio">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Volver a la web</span>
          <span className="sm:hidden">Inicio</span>
        </Link>
      </Button>
      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            aria-label="Ir a la página de inicio"
            className="group flex flex-col items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-sidebar transition-transform group-hover:scale-105">
              <img
                src="/favicon/favicon.svg"
                alt=""
                className="h-16 w-16"
                width={64}
                height={64}
              />
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-secondary sm:text-[2rem]">
              <span className="text-primary">Logi</span>
              Lock
            </h1>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Stock, trazabilidad y acceso inteligente en una única plataforma.
          </p>
          <div className="mt-4 h-0.5 w-10 rounded-full bg-primary" aria-hidden />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          {heading ? (
            <h2 className="mb-4 text-center font-heading text-base font-semibold">{heading}</h2>
          ) : null}
          {children}
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Sistema interno · Acceso restringido
        </p>
      </div>
    </div>
  );
}
