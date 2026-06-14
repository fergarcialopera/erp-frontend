import { formatStockLocationPlain, resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ProductStockLocation } from "@/types/models";

export function formatStockLocationLabel(location: ProductStockLocation): string {
  const labels = resolveStockLocationLabels(location.ambiente, location.zone);
  const plain = formatStockLocationPlain(labels, " / ");
  return plain || "Stock general";
}
