import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "inactive";

const variants: Record<BadgeVariant, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted/50 text-muted-foreground/70 border-border/50",
};

function resolveVariant(status: string): BadgeVariant {
  const normalized = status.trim().toLowerCase();
  if (
    normalized === "true" ||
    normalized === "active" ||
    normalized === "activo" ||
    normalized === "visible" ||
    normalized.startsWith("activo") ||
    normalized.startsWith("visible")
  ) {
    return "active";
  }
  return "inactive";
}

interface StatusBadgeProps {
  status: string;
  type?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = resolveVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border leading-tight",
        variants[variant],
        className,
      )}
      role="status"
    >
      {status}
    </span>
  );
}
