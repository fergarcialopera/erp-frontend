import { resolveStockLocationLabels, type StockLocationLabels } from "@/lib/stockLocation";
import type { ProductStockLocation } from "@/types/models";

/** Stock disponible en una zona (o ubicación general sin zona). */
export interface ZonaStock {
  zoneId: string | null;
  quantity: number;
  location: StockLocationLabels;
}

export interface ExitPickLine {
  zoneId: string | null;
  quantity: number;
  location: StockLocationLabels;
}

function compareZoneId(a: string | null, b: string | null): number {
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/** Entre candidatos, elige la zona más adecuada para cubrir `remaining` unidades. */
function pickNextZone(candidates: ZonaStock[], remaining: number): ZonaStock {
  return [...candidates].sort((a, b) => {
    const distA = Math.abs(a.quantity - remaining);
    const distB = Math.abs(b.quantity - remaining);
    if (distA !== distB) return distA - distB;
    if (b.quantity !== a.quantity) return b.quantity - a.quantity;
    return compareZoneId(a.zoneId, b.zoneId);
  })[0];
}

/**
 * Calcula de qué zonas retirar stock para una solicitud.
 *
 * 1. Si una sola zona puede cubrir la solicitud → la de menos unidades (vaciar pequeñas).
 * 2. Si varias pueden cubrirla solas → la de menos stock entre las que alcanzan.
 * 3. Si hace falta combinar → primero la más cercana en cantidad al pendiente, luego la siguiente.
 */
export function planExitPick(requestedQuantity: number, zones: ZonaStock[]): ExitPickLine[] {
  if (requestedQuantity <= 0) return [];

  const available = zones.filter((z) => z.quantity > 0);
  if (available.length === 0) return [];

  const canFulfillAlone = available.filter((z) => z.quantity >= requestedQuantity);
  if (canFulfillAlone.length > 0) {
    const chosen = [...canFulfillAlone].sort((a, b) => {
      if (a.quantity !== b.quantity) return a.quantity - b.quantity;
      return compareZoneId(a.zoneId, b.zoneId);
    })[0];
    return [
      {
        zoneId: chosen.zoneId,
        quantity: requestedQuantity,
        location: chosen.location,
      },
    ];
  }

  const working = available.map((z) => ({ ...z }));
  const picks: ExitPickLine[] = [];
  let remaining = requestedQuantity;

  while (remaining > 0) {
    const candidates = working.filter((z) => z.quantity > 0);
    if (candidates.length === 0) break;

    const chosen = pickNextZone(candidates, remaining);
    const take = Math.min(chosen.quantity, remaining);
    picks.push({
      zoneId: chosen.zoneId,
      quantity: take,
      location: chosen.location,
    });
    remaining -= take;
    const slot = working.find((z) => z.zoneId === chosen.zoneId);
    if (slot) slot.quantity -= take;
  }

  return picks;
}

export function productStockLocationsToZones(locations: ProductStockLocation[]): ZonaStock[] {
  return locations
    .filter((loc) => loc.quantity > 0)
    .map((loc) => ({
      zoneId: loc.zone?.id ?? null,
      quantity: loc.quantity,
      location: resolveStockLocationLabels(loc.ambiente, loc.zone),
    }));
}

export function sumPickQuantity(lines: ExitPickLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
