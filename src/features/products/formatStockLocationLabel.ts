import type { ProductStockLocation } from "@/types/models";

export function formatStockLocationLabel(location: ProductStockLocation): string {
  const parts = [
    location.locker?.name,
    location.compartment?.code,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Stock general";
}
