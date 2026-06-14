import type { ExitPickLine } from "./planExitPick";
import type { CreateExitLogItem } from "./api";

/** Convierte el plan de un producto al formato POST /exit-logs (OpenAPI). */
export function planLinesToCreateItem(
  productId: string,
  plan: ExitPickLine[],
): CreateExitLogItem | null {
  const active = plan.filter((line) => line.quantity > 0);
  if (active.length === 0) return null;

  const withZone = active.filter((line) => line.zoneId);
  if (withZone.length === 0) {
    const total = active.reduce((sum, line) => sum + line.quantity, 0);
    return { product_id: productId, quantity: total };
  }

  if (withZone.length === 1 && withZone[0].quantity === active.reduce((s, l) => s + l.quantity, 0)) {
    return {
      product_id: productId,
      quantity: withZone[0].quantity,
      zone_id: withZone[0].zoneId!,
    };
  }

  return {
    product_id: productId,
    locations: withZone.map((line) => ({
      zone_id: line.zoneId!,
      quantity: line.quantity,
    })),
  };
}
