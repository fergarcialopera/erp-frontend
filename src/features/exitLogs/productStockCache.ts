import { fetchProductStockLocations } from "@/features/products/api";
import { productStockLocationsToCompartments, type CompartmentStock } from "./planExitPick";

export type ProductStockCache = Map<string, CompartmentStock[]>;

export function totalCompartmentStock(compartments: CompartmentStock[]): number {
  return compartments.reduce((sum, row) => sum + row.quantity, 0);
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
      cache.set(productId, productStockLocationsToCompartments(stock.locations));
    }),
  );

  return cache;
}
