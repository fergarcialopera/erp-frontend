import type { PendingExitItem } from "@/features/dashboard/types";
import type { ExitLogDetail } from "./api";

/** Convierte el detalle de un borrador en ítems editables para confirmación. */
export function mapExitLogDetailToPendingItems(detail: ExitLogDetail): PendingExitItem[] {
  const exitLogId = detail.exit_log.id;

  return detail.items
    .map((line) => {
      const productId = line.product?.id;
      if (!productId) return null;

      return {
        productId,
        sku: line.product?.sku ?? "",
        name: line.product?.name ?? "",
        barcode: line.product?.barcode ?? undefined,
        availableStock: line.stock_available ?? 0,
        quantity: line.requested_quantity,
        exitLogId,
        exitLogItemId: line.id,
        confirmedQuantity: line.requested_quantity,
      };
    })
    .filter((row): row is PendingExitItem => row !== null);
}
