import type { PendingExitItem } from "@/features/dashboard/types";
import {
  planExitPick,
  sumPickQuantity,
  type CompartmentStock,
} from "./planExitPick";

function pendingLineId(
  productId: string,
  compartmentId: string | null,
  existingId?: string,
): string {
  if (existingId && !existingId.startsWith("pending:")) return existingId;
  return `pending:${productId}:${compartmentId ?? "general"}`;
}

function compartmentKey(compartmentId: string | undefined): string | null {
  return compartmentId ?? null;
}

/** Recalcula las líneas de un producto según cantidad y stock en caché. */
export function replanPendingProductLines(
  productId: string,
  quantity: number,
  currentItems: PendingExitItem[],
  compartments: CompartmentStock[],
): PendingExitItem[] {
  const head = currentItems.find((item) => item.productId === productId);
  if (!head) return currentItems;

  const qty = Math.max(0, Math.floor(quantity));
  if (qty === 0) {
    return currentItems.filter((item) => item.productId !== productId);
  }

  const plan = planExitPick(qty, compartments);
  if (sumPickQuantity(plan) < qty) {
    return currentItems;
  }

  const existingIds = new Map<string | null, string>();
  for (const item of currentItems) {
    if (item.productId !== productId) continue;
    existingIds.set(compartmentKey(item.compartmentId), item.exitLogItemId);
  }

  const newLines: PendingExitItem[] = plan.map((line) => ({
    productId: head.productId,
    sku: head.sku,
    name: head.name,
    barcode: head.barcode,
    availableStock: head.availableStock,
    locations: head.locations,
    exitLogId: head.exitLogId,
    exitLogItemId: pendingLineId(
      productId,
      line.compartmentId,
      existingIds.get(line.compartmentId),
    ),
    quantity: line.quantity,
    confirmedQuantity: line.quantity,
    compartmentId: line.compartmentId ?? undefined,
    pickLocation: line.location,
  }));

  return [...currentItems.filter((item) => item.productId !== productId), ...newLines];
}
