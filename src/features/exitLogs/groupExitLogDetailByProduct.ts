import { resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ExitLogLocationPick, ExitLogProductDisplayRow } from "@/types/models";
import type { ExitLogDetail, ExitLogLocationLine } from "./api";

function locationLineQuantity(line: ExitLogLocationLine): number {
  const confirmed = line.confirmed_quantity;
  if (confirmed != null && Number.isFinite(confirmed)) return confirmed;
  return line.requested_quantity;
}

/** Convierte el detalle API (un ítem por producto) en filas visuales para tablas. */
export function groupExitLogDetailByProduct(detail: ExitLogDetail): ExitLogProductDisplayRow[] {
  const header = detail.exit_log;

  return detail.items
    .map((productItem) => {
      const productId = productItem.product?.id;
      if (!productId) return null;

      const locationPicks: ExitLogLocationPick[] = (productItem.locations ?? []).map((line) => ({
        labels: resolveStockLocationLabels(line.ambiente, line.zone),
        quantity: locationLineQuantity(line),
      }));

      const totalQuantity =
        productItem.requested_quantity_total ??
        locationPicks.reduce((sum, pick) => sum + pick.quantity, 0);

      return {
        id: `${header.id}:${productId}`,
        exitLogId: header.id,
        productId,
        productName: productItem.product?.name?.trim() || "—",
        productSku: productItem.product?.sku?.trim() || productId,
        totalQuantity,
        locationPicks,
        status: header.status ?? "DRAFT",
        created_at: header.created_at ?? new Date().toISOString(),
        created_by_name:
          header.created_by?.name?.trim() ||
          header.created_by?.email?.trim() ||
          "—",
        note: header.note ?? undefined,
      };
    })
    .filter((row): row is ExitLogProductDisplayRow => row !== null);
}
