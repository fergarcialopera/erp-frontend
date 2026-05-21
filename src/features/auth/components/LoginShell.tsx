import { Lock } from "lucide-react";

interface LoginShellProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function LoginShell({
  title = "LockERP",
  subtitle = "Acceso al sistema",
  children,
  footer,
}: LoginShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Sistema interno · Acceso restringido
        </p>
      </div>
    </div>
  );
}
