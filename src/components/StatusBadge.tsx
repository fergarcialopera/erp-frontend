import { CompartmentStatus } from "@/types/models";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "pending"
  | "retired"
  | "cancelled"
  | "available"
  | "maintenance"
  | "active"
  | "inactive";

const variants: Record<BadgeVariant, string> = {
  pending: "bg-accent/15 text-accent border-accent/25",
  retired: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-muted/50 text-muted-foreground/70 border-border/50",
  available: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted/50 text-muted-foreground/70 border-border/50",
};

const compartmentStatusMap: Record<CompartmentStatus, BadgeVariant> = {
  AVAILABLE: "available",
  MAINTENANCE: "maintenance",
};

interface StatusBadgeProps {
  status: string;
  type?: "compartment" | "active";
  className?: string;
}

export function StatusBadge({ status, type = "compartment", className }: StatusBadgeProps) {
  let variant: BadgeVariant;

  if (type === "compartment") {
    variant = compartmentStatusMap[status as CompartmentStatus] || "retired";
  } else {
    variant =
      status === "true" || status === "active" || status === "Activo" ? "active" : "inactive";
  }

  const label =
    type === "active" ? (variant === "active" ? "Activo" : "Inactivo") : (status as string);

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
