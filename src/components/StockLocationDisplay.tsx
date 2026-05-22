import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stockLocationKey, type StockLocationLabels } from "@/lib/stockLocation";
import type { ExitLogLocationPick } from "@/types/models";

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

interface StockLocationPicksListProps {
  picks: ExitLogLocationPick[];
  className?: string;
  emptyLabel?: string;
}

/** Varias ubicaciones con cantidad retirada en cada una (salida de stock). */
export function StockLocationPicksList({
  picks,
  className,
  emptyLabel = "—",
}: StockLocationPicksListProps) {
  if (picks.length === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{emptyLabel}</span>;
  }

  return (
    <ul className={cn("space-y-1", className)}>
      {picks.map((pick) => (
        <li
          key={stockLocationKey(pick.labels)}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <StockLocationDisplay
            {...pick.labels}
            emptyLabel="Stock general"
            className="min-w-0"
          />
          <span className="shrink-0 tabular-nums font-medium">{pick.quantity}</span>
        </li>
      ))}
    </ul>
  );
}
