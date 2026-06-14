import { fetchProductStockLocations } from "@/features/products/api";
import type { ExitDraftItem } from "@/features/dashboard/types";
import type { CreateExitLogItem } from "./api";
import { planLinesToCreateItem } from "./buildExitLogCreatePayload";
import type { ProductStockCache } from "./productStockCache";
import {
  planExitPick,
  productStockLocationsToZones,
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

/** Convierte el borrador del dashboard en ítems POST /exit-logs (un producto → locations[]). */
export async function buildExitLogCreateItemsFromDraft(
  draft: ExitDraftItem[],
): Promise<BuildExitLogCreateItemsResult> {
  const items: CreateExitLogItem[] = [];
  const cache: ProductStockCache = new Map();

  for (const item of draft) {
    const stock = await fetchProductStockLocations(item.productId);
    const zones = productStockLocationsToZones(stock.locations);
    cache.set(item.productId, zones);
    const plan = planExitPick(item.quantity, zones);
    const planned = sumPickQuantity(plan);

    if (plan.length === 0 || planned < item.quantity) {
      throw new ExitPickInsufficientStockError(item.name, item.quantity, planned);
    }

    const createItem = planLinesToCreateItem(item.productId, plan);
    if (createItem) {
      items.push(createItem);
    }
  }

  return { items, cache };
}
