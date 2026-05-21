import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stockLocationKey, type StockLocationLabels } from "@/lib/stockLocation";

interface StockLocationDisplayProps extends StockLocationLabels {
  className?: string;
  /** Texto cuando no hay locker ni compartimento. */
  emptyLabel?: string;
}

export function StockLocationDisplay({
  locker,
  compartment,
  className,
  emptyLabel = "—",
}: StockLocationDisplayProps) {
  const lockerLabel = locker?.trim() || null;
  const compartmentLabel = compartment?.trim() || null;

  if (!lockerLabel && !compartmentLabel) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{emptyLabel}</span>;
  }

  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <Badge
        variant="secondary"
        className="rounded-full px-2 py-0 font-mono text-[11px] font-normal leading-5"
      >
        {lockerLabel ?? "—"}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-full px-2 py-0 font-mono text-[11px] font-normal leading-5"
      >
        {compartmentLabel ?? "—"}
      </Badge>
    </div>
  );
}

interface StockLocationsListProps {
  locations: StockLocationLabels[];
  className?: string;
  emptyLabel?: string;
}

/** Varias ubicaciones (p. ej. resumen de salida con varias líneas). */
export function StockLocationsList({
  locations,
  className,
  emptyLabel = "—",
}: StockLocationsListProps) {
  if (locations.length === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{emptyLabel}</span>;
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {locations.map((loc) => (
        <StockLocationDisplay
          key={stockLocationKey(loc)}
          locker={loc.locker}
          compartment={loc.compartment}
        />
      ))}
    </div>
  );
}
