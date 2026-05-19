import { cn } from "@/lib/utils";

const EXIT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

const EXIT_STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-accent/15 text-accent border-accent/25",
  CONFIRMED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-muted/50 text-muted-foreground border-border/50",
};

export function ExitStatusBadge({ status }: { status?: string }) {
  const key = (status ?? "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border",
        EXIT_STATUS_CLASS[key] ?? "bg-muted text-muted-foreground border-border",
      )}
      role="status"
    >
      {EXIT_STATUS_LABEL[key] ?? status ?? "—"}
    </span>
  );
}
