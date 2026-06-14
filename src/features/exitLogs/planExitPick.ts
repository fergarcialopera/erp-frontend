import { resolveStockLocationLabels, type StockLocationLabels } from "@/lib/stockLocation";
import type { ProductStockLocation } from "@/types/models";

/** Stock disponible en un compartimento (o ubicación general sin compartimento). */
export interface CompartmentStock {
  compartmentId: string | null;
  quantity: number;
  location: StockLocationLabels;
}

export interface ExitPickLine {
  compartmentId: string | null;
  quantity: number;
  location: StockLocationLabels;
}

function compareCompartmentId(a: string | null, b: string | null): number {
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/** Entre candidatos, elige el compartimento más adecuado para cubrir `remaining` unidades. */
function pickNextCompartment(
  candidates: CompartmentStock[],
  remaining: number,
): CompartmentStock {
  return [...candidates].sort((a, b) => {
    const distA = Math.abs(a.quantity - remaining);
    const distB = Math.abs(b.quantity - remaining);
    if (distA !== distB) return distA - distB;
    if (b.quantity !== a.quantity) return b.quantity - a.quantity;
    return compareCompartmentId(a.compartmentId, b.compartmentId);
  })[0];
}

/**
 * Calcula de qué compartimentos retirar stock para una solicitud.
 *
 * 1. Si un solo compartimento puede cubrir la solicitud → el de menos unidades (vaciar pequeños).
 * 2. Si varios pueden cubrirla solos → el de menos stock entre los que alcanzan.
 * 3. Si hace falta combinar → primero el más cercano en cantidad al pendiente, luego el siguiente.
 */
export function planExitPick(
  requestedQuantity: number,
  compartments: CompartmentStock[],
): ExitPickLine[] {
  if (requestedQuantity <= 0) return [];

  const available = compartments.filter((c) => c.quantity > 0);
  if (available.length === 0) return [];

  const canFulfillAlone = available.filter((c) => c.quantity >= requestedQuantity);
  if (canFulfillAlone.length > 0) {
    const chosen = [...canFulfillAlone].sort((a, b) => {
      if (a.quantity !== b.quantity) return a.quantity - b.quantity;
      return compareCompartmentId(a.compartmentId, b.compartmentId);
    })[0];
    return [
      {
        compartmentId: chosen.compartmentId,
        quantity: requestedQuantity,
        location: chosen.location,
      },
    ];
  }

  const working = available.map((c) => ({ ...c }));
  const picks: ExitPickLine[] = [];
  let remaining = requestedQuantity;

  while (remaining > 0) {
    const candidates = working.filter((c) => c.quantity > 0);
    if (candidates.length === 0) break;

    const chosen = pickNextCompartment(candidates, remaining);
    const take = Math.min(chosen.quantity, remaining);
    picks.push({
      compartmentId: chosen.compartmentId,
      quantity: take,
      location: chosen.location,
    });
    remaining -= take;
    const slot = working.find((c) => c.compartmentId === chosen.compartmentId);
    if (slot) slot.quantity -= take;
  }

  return picks;
}

export function productStockLocationsToCompartments(
  locations: ProductStockLocation[],
): CompartmentStock[] {
  return locations
    .filter((loc) => loc.quantity > 0)
    .map((loc) => ({
      compartmentId: loc.compartment?.id ?? null,
      quantity: loc.quantity,
      location: resolveStockLocationLabels(loc.ambiente, loc.compartment),
    }));
}

export function sumPickQuantity(lines: ExitPickLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
