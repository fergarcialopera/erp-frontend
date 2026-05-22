import type { PendingExitItem } from "@/features/dashboard/types";
import { resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ExitLogDetail } from "./api";

/** Convierte el detalle de un borrador en ítems editables para confirmación. */
export function mapExitLogDetailToPendingItems(detail: ExitLogDetail): PendingExitItem[] {
  const exitLogId = detail.exit_log.id;

  return detail.items
    .map((line) => {
      const productId = line.product?.id;
      if (!productId) return null;

      const pickLocation = resolveStockLocationLabels(line.locker, line.compartment);

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
        compartmentId: line.compartment?.id,
        pickLocation,
        locations: pickLocation.locker || pickLocation.compartment ? [pickLocation] : [],
      };
    })
    .filter((row): row is PendingExitItem => row !== null);
}
