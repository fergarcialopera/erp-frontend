import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stockLocationKey, type StockLocationLabels } from "@/lib/stockLocation";
import type { ExitLogLocationPick } from "@/types/models";

/** Ancho = contenido; tope = 50 % del contenedor (celda de tabla). */
const locationPillBase =
  "inline-flex w-fit min-w-min max-w-[50%] shrink truncate rounded-full px-1.5 sm:px-2 py-0 font-mono text-[10px] sm:text-[11px] font-normal leading-4 sm:leading-5";

const locationPillsLayout =
  "flex w-full min-w-0 max-w-full flex-col items-start gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1";

interface StockLocationDisplayProps extends StockLocationLabels {
  className?: string;
  /** Texto cuando no hay ambiente ni zona. */
  emptyLabel?: string;
}

export function StockLocationDisplay({
  ambiente,
  zona,
  className,
  emptyLabel = "—",
}: StockLocationDisplayProps) {
  const ambienteLabel = ambiente?.trim() || null;
  const zonaLabel = zona?.trim() || null;

  if (!ambienteLabel && !zonaLabel) {
    return (
      <span className={cn("text-xs sm:text-sm text-muted-foreground", className)}>{emptyLabel}</span>
    );
  }

  return (
    <div className={cn(locationPillsLayout, className)}>
      {ambienteLabel ? (
        <Badge
          variant="secondary"
          title={ambienteLabel}
          className={locationPillBase}
        >
          {ambienteLabel}
        </Badge>
      ) : null}
      {zonaLabel ? (
        <Badge
          variant="outline"
          title={zonaLabel}
          className={locationPillBase}
        >
          {zonaLabel}
        </Badge>
      ) : null}
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
    return (
      <span className={cn("text-xs sm:text-sm text-muted-foreground", className)}>{emptyLabel}</span>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {locations.map((loc, index) => (
        <StockLocationDisplay
          key={`${stockLocationKey(loc)}:${index}`}
          ambiente={loc.ambiente}
          zona={loc.zona}
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
    return (
      <span className={cn("text-xs sm:text-sm text-muted-foreground", className)}>{emptyLabel}</span>
    );
  }

  return (
    <ul className={cn("space-y-1", className)}>
      {picks.map((pick, index) => (
        <li
          key={`${stockLocationKey(pick.labels)}:${index}`}
          className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs"
        >
          <StockLocationDisplay
            {...pick.labels}
            emptyLabel="Stock general"
            className="min-w-0 flex-1"
          />
          <span className="shrink-0 tabular-nums font-medium pt-0.5 sm:pt-0">{pick.quantity}</span>
        </li>
      ))}
    </ul>
  );
}
