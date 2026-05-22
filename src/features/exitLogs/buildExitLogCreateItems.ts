import { fetchProductStockLocations } from "@/features/products/api";
import type { ExitDraftItem } from "@/features/dashboard/types";
import type { CreateExitLogItem } from "./api";
import type { ProductStockCache } from "./productStockCache";
import {
  planExitPick,
  productStockLocationsToCompartments,
  sumPickQuantity,
} from "./planExitPick";

export class ExitPickInsufficientStockError extends Error {
  readonly productName: string;
  readonly requested: number;
  readonly planned: number;

  constructor(productName: string, requested: number, planned: number) {
    super(
      `Stock insuficiente para ${productName}: solicitado ${requested}, planificable ${planned}.`,
    );
    this.name = "ExitPickInsufficientStockError";
    this.productName = productName;
    this.requested = requested;
    this.planned = planned;
  }
}

export interface BuildExitLogCreateItemsResult {
  items: CreateExitLogItem[];
  cache: ProductStockCache;
}

/** Convierte el borrador del dashboard en líneas POST /exit-logs con compartimentos optimizados. */
export async function buildExitLogCreateItemsFromDraft(
  draft: ExitDraftItem[],
): Promise<BuildExitLogCreateItemsResult> {
  const items: CreateExitLogItem[] = [];
  const cache: ProductStockCache = new Map();

  for (const item of draft) {
    const stock = await fetchProductStockLocations(item.productId);
    const compartments = productStockLocationsToCompartments(stock.locations);
    cache.set(item.productId, compartments);
    const plan = planExitPick(item.quantity, compartments);
    const planned = sumPickQuantity(plan);

    if (plan.length === 0 || planned < item.quantity) {
      throw new ExitPickInsufficientStockError(item.name, item.quantity, planned);
    }

    for (const line of plan) {
      items.push({
        product_id: item.productId,
        quantity: line.quantity,
        ...(line.compartmentId ? { compartment_id: line.compartmentId } : {}),
      });
    }
  }

  return { items, cache };
}
