import { fetchProductStockLocations } from "@/features/products/api";
import { productStockLocationsToZones, type ZonaStock } from "./planExitPick";

export type ProductStockCache = Map<string, ZonaStock[]>;

export function totalZoneStock(zones: ZonaStock[]): number {
  return zones.reduce((sum, row) => sum + row.quantity, 0);
}

/** Precarga ubicaciones de varios productos (p. ej. al abrir confirmación). */
export async function prefetchProductStockCache(
  productIds: string[],
): Promise<ProductStockCache> {
  const uniqueIds = [...new Set(productIds)];
  const cache: ProductStockCache = new Map();

  await Promise.all(
    uniqueIds.map(async (productId) => {
      const stock = await fetchProductStockLocations(productId);
      cache.set(productId, productStockLocationsToZones(stock.locations));
    }),
  );

  return cache;
}
