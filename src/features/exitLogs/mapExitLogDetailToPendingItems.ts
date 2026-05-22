import type { PendingExitItem } from "@/features/dashboard/types";
import { resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ExitLogDetail } from "./api";

/** Convierte el detalle de un borrador en ítems editables para confirmación (una fila por ubicación). */
export function mapExitLogDetailToPendingItems(detail: ExitLogDetail): PendingExitItem[] {
  const exitLogId = detail.exit_log.id;
  const rows: PendingExitItem[] = [];

  for (const productItem of detail.items) {
    const productId = productItem.product?.id;
    if (!productId) continue;

    const productStockTotal = (productItem.locations ?? []).reduce(
      (sum, line) => sum + Number(line.stock_available ?? 0),
      0,
    );

    for (const line of productItem.locations ?? []) {
      const pickLocation = resolveStockLocationLabels(line.locker, line.compartment);
      const qty = line.requested_quantity;

      rows.push({
        productId,
        sku: productItem.product?.sku ?? "",
        name: productItem.product?.name ?? "",
        barcode: productItem.product?.barcode ?? undefined,
        availableStock: productStockTotal,
        quantity: qty,
        exitLogId,
        exitLogItemId: line.item_id,
        confirmedQuantity: qty,
        compartmentId: line.compartment?.id,
        pickLocation,
      });
    }
  }

  return rows;
}
