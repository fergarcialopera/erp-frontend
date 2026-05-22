import type { ExitPickLine } from "./planExitPick";
import type { CreateExitLogItem } from "./api";

/** Convierte el plan de un producto al formato POST /exit-logs (OpenAPI). */
export function planLinesToCreateItem(
  productId: string,
  plan: ExitPickLine[],
): CreateExitLogItem | null {
  const active = plan.filter((line) => line.quantity > 0);
  if (active.length === 0) return null;

  const withCompartment = active.filter((line) => line.compartmentId);
  if (withCompartment.length === 0) {
    const total = active.reduce((sum, line) => sum + line.quantity, 0);
    return { product_id: productId, quantity: total };
  }

  if (withCompartment.length === 1 && withCompartment[0].quantity === active.reduce((s, l) => s + l.quantity, 0)) {
    return {
      product_id: productId,
      quantity: withCompartment[0].quantity,
      compartment_id: withCompartment[0].compartmentId!,
    };
  }

  return {
    product_id: productId,
    locations: withCompartment.map((line) => ({
      compartment_id: line.compartmentId!,
      quantity: line.quantity,
    })),
  };
}
