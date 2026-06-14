import type { PendingExitItem } from "@/features/dashboard/types";
import {
  planExitPick,
  sumPickQuantity,
  type ZonaStock,
} from "./planExitPick";

function pendingLineId(
  productId: string,
  zoneId: string | null,
  existingId?: string,
): string {
  if (existingId && !existingId.startsWith("pending:")) return existingId;
  return `pending:${productId}:${zoneId ?? "general"}`;
}

function zoneKey(zoneId: string | undefined): string | null {
  return zoneId ?? null;
}

/** Recalcula las líneas de un producto según cantidad y stock en caché. */
export function replanPendingProductLines(
  productId: string,
  quantity: number,
  currentItems: PendingExitItem[],
  zones: ZonaStock[],
): PendingExitItem[] {
  const head = currentItems.find((item) => item.productId === productId);
  if (!head) return currentItems;

  const qty = Math.max(0, Math.floor(quantity));
  if (qty === 0) {
    return currentItems.filter((item) => item.productId !== productId);
  }

  const plan = planExitPick(qty, zones);
  if (sumPickQuantity(plan) < qty) {
    return currentItems;
  }

  const existingIds = new Map<string | null, string>();
  for (const item of currentItems) {
    if (item.productId !== productId) continue;
    existingIds.set(zoneKey(item.zoneId), item.exitLogItemId);
  }

  const newLines: PendingExitItem[] = plan.map((line) => ({
    productId: head.productId,
    sku: head.sku,
    name: head.name,
    barcode: head.barcode,
    availableStock: head.availableStock,
    exitLogId: head.exitLogId,
    exitLogItemId: pendingLineId(
      productId,
      line.zoneId,
      existingIds.get(line.zoneId),
    ),
    quantity: line.quantity,
    confirmedQuantity: line.quantity,
    zoneId: line.zoneId ?? undefined,
    pickLocation: line.location,
  }));

  return [...currentItems.filter((item) => item.productId !== productId), ...newLines];
}
