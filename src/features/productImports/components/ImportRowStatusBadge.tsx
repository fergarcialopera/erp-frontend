import { cn } from "@/lib/utils";
import { rowStatusLabel } from "../labels";
import type { ProductImportRowStatus } from "../types";

const ROW_STATUS_CLASS: Record<ProductImportRowStatus, string> = {
  ready: "bg-success/10 text-success border-success/20",
  conflict:
    "bg-[hsla(36,100%,65%,0.14)] text-[hsl(var(--ll-warning-700))] border-[hsla(36,100%,65%,0.35)]",
  invalid: "bg-destructive/10 text-destructive border-destructive/25",
  created: "bg-success/10 text-success border-success/20",
  updated: "bg-primary/10 text-primary border-primary/25",
  failed: "bg-destructive/10 text-destructive border-destructive/25",
  skipped: "bg-muted/50 text-muted-foreground border-border/50",
};

export function ImportRowStatusBadge({ status }: { status: string }) {
  const key = status as ProductImportRowStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border leading-tight",
        ROW_STATUS_CLASS[key] ?? "bg-muted text-muted-foreground border-border",
      )}
      role="status"
    >
      {rowStatusLabel(status)}
    </span>
  );
}
