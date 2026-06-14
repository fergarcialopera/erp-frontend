import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "inactive";

const variants: Record<BadgeVariant, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted/50 text-muted-foreground/70 border-border/50",
};

interface StatusBadgeProps {
  status: string;
  type?: "active";
  className?: string;
}

export function StatusBadge({ status, type = "active", className }: StatusBadgeProps) {
  const variant: BadgeVariant =
    status === "true" || status === "active" || status === "Activo" ? "active" : "inactive";

  const label = variant === "active" ? "Activo" : "Inactivo";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border leading-tight",
        variants[variant],
        className,
      )}
      role="status"
    >
      {label}
    </span>
  );
}
