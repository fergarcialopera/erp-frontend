import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Sin datos",
  description = "No se encontraron registros.",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <section
      className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in"
      aria-label={title}
      role="status"
    >
      <div
        className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4"
        aria-hidden
      >
        {icon || <FileQuestion className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground text-center max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
