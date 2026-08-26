import { cn } from "@/lib/utils";
import { sessionStatusLabel } from "../labels";
import type { ProductImportSessionStatus } from "../types";

const SESSION_STATUS_CLASS: Record<ProductImportSessionStatus, string> = {
  analyzing: "bg-accent/15 text-accent border-accent/25",
  ready_for_review: "bg-primary/10 text-primary border-primary/25",
  invalid: "bg-destructive/10 text-destructive border-destructive/25",
  processing: "bg-accent/15 text-accent border-accent/25",
  completed: "bg-success/10 text-success border-success/20",
  completed_with_errors:
    "bg-[hsla(36,100%,65%,0.14)] text-[hsl(var(--ll-warning-700))] border-[hsla(36,100%,65%,0.35)]",
  cancelled: "bg-muted/50 text-muted-foreground border-border/50",
};

export function ImportSessionStatusBadge({ status }: { status: string }) {
  const key = status as ProductImportSessionStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border leading-tight",
        SESSION_STATUS_CLASS[key] ?? "bg-muted text-muted-foreground border-border",
      )}
      role="status"
    >
      {sessionStatusLabel(status)}
    </span>
  );
}
