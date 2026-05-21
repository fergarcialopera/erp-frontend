import { MapPin } from "lucide-react";
import { useProductStockLocations } from "@/features/products/queries";
import { formatStockLocationLabel } from "@/features/products/formatStockLocationLabel";

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
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Ubicaciones actuales
        {data && !loading && (
          <span className="font-normal">
            · stock total{" "}
            <span className="tabular-nums text-foreground">{data.quantity_total}</span>
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
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="min-w-0 truncate">{formatStockLocationLabel(location)}</span>
                <span className="shrink-0 tabular-nums font-medium">{location.quantity}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
