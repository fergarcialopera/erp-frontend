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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <img
            src="/favicon/favicon.svg"
            alt=""
            className="h-16 w-16 mb-5"
          />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Logi</span>
            <span className="text-secondary">Lock</span>
          </h1>
          <p className="text-sm text-foreground/80 mt-3 max-w-sm leading-relaxed">
            Stock, trazabilidad y acceso inteligente en una única plataforma.
          </p>
          <div className="mt-4 h-0.5 w-10 rounded-full bg-secondary" aria-hidden />
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          {heading ? (
            <h2 className="text-base font-semibold text-center mb-4">{heading}</h2>
          ) : null}
          {children}
        </div>
        {footer ? <div className="mt-4">{footer}</div> : null}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Sistema interno · Acceso restringido
        </p>
      </div>
    </div>
  );
}
