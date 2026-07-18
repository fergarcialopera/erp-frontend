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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 50% 0%, hsla(167, 90%, 48%, 0.12), transparent 42%), linear-gradient(180deg, hsl(var(--ll-navy-950)) 0%, hsl(var(--ll-navy-900)) 55%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg animate-fade-up">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src="/favicon/favicon.svg"
              alt=""
              className="mb-5 h-16 w-16"
              width={64}
              height={64}
            />
            <h1 className="font-heading text-3xl font-bold tracking-tight text-secondary sm:text-[2rem]">
              <span className="text-primary">Logi</span>
              Lock
            </h1>
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
    </div>
  );
}
