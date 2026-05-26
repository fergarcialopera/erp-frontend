import { MapPin } from "lucide-react";
import { useProductStockLocations } from "@/features/products/queries";
import { StockLocationDisplay } from "@/components/StockLocationDisplay";
import { resolveStockLocationLabels } from "@/lib/stockLocation";

interface ProductStockLocationsPanelProps {
  productId: string | undefined;
}

export function ProductStockLocationsPanel({ productId }: ProductStockLocationsPanelProps) {
  const { data, isLoading, isFetching } = useProductStockLocations(productId);

  if (!productId) return null;

  const loading = isLoading || isFetching;
  const locations = data?.locations ?? [];

  return (
    <div
      className="rounded-md border bg-muted/40 px-3 py-2.5 space-y-2"
      aria-live="polite"
      aria-busy={loading}
    >
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Ubicaciones actuales</span>
        {data && !loading && (
          <span className="font-normal tabular-nums">
            · stock total{" "}
            <span className="text-foreground">{data.quantity_total}</span>
          </span>
        )}
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">Cargando ubicaciones…</p>
      )}

      {!loading && locations.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Este producto no tiene stock en lockers ni compartimentos.
        </p>
      )}

      {!loading && locations.length > 0 && (
        <ul className="space-y-1">
          {locations.map((location, index) => {
            const key = [
              location.locker?.id ?? "_",
              location.compartment?.id ?? "_",
              String(index),
            ].join(":");
            return (
              <li
                key={key}
                className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs"
              >
                <StockLocationDisplay
                  {...resolveStockLocationLabels(location.locker, location.compartment)}
                  emptyLabel="Stock general"
                  className="min-w-0 flex-1"
                />
                <span className="shrink-0 tabular-nums font-medium pt-0.5 sm:pt-0">
                  {location.quantity}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
