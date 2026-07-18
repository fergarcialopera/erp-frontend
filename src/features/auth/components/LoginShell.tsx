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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
  );
}
