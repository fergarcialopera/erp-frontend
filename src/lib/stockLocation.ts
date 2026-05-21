/** Etiquetas de locker y compartimento para mostrar en UI. */
export interface StockLocationLabels {
  locker?: string | null;
  compartment?: string | null;
}

export interface LockerRefLike {
  id?: string;
  code?: string;
  name?: string;
  device_id?: string | null;
}

export interface CompartmentRefLike {
  id?: string;
  code?: string;
  name?: string;
}

export interface LockerFlatFallbacks {
  locker_id?: string;
  locker_code?: string;
  locker_name?: string;
}

export interface CompartmentFlatFallbacks {
  compartment_id?: string;
  compartment_code?: string;
  compartment_name?: string;
}

export function resolveLockerLabel(
  locker?: LockerRefLike | null,
  fallbacks?: LockerFlatFallbacks,
): string | undefined {
  const label =
    locker?.code?.trim() ||
    locker?.name?.trim() ||
    locker?.device_id?.trim() ||
    fallbacks?.locker_code?.trim() ||
    fallbacks?.locker_name?.trim() ||
    fallbacks?.locker_id?.trim();
  return label || undefined;
}

export function resolveCompartmentLabel(
  compartment?: CompartmentRefLike | null,
  fallbacks?: CompartmentFlatFallbacks,
): string | undefined {
  const label =
    compartment?.code?.trim() ||
    compartment?.name?.trim() ||
    fallbacks?.compartment_code?.trim() ||
    fallbacks?.compartment_name?.trim() ||
    fallbacks?.compartment_id?.trim();
  return label || undefined;
}

export function resolveStockLocationLabels(
  locker?: LockerRefLike | null,
  compartment?: CompartmentRefLike | null,
  fallbacks?: LockerFlatFallbacks & CompartmentFlatFallbacks,
): StockLocationLabels {
  return {
    locker: resolveLockerLabel(locker, fallbacks),
    compartment: resolveCompartmentLabel(compartment, fallbacks),
  };
}

/** Clave estable para deduplicar ubicaciones en listas. */
export function stockLocationKey(labels: StockLocationLabels): string {
  return `${labels.locker ?? ""}|${labels.compartment ?? ""}`;
}

export function uniqueStockLocations(locations: StockLocationLabels[]): StockLocationLabels[] {
  const seen = new Set<string>();
  const result: StockLocationLabels[] = [];
  for (const loc of locations) {
    const key = stockLocationKey(loc);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(loc);
  }
  return result;
}

/** Texto plano para ordenación, búsqueda o aria-label. */
export function formatStockLocationPlain(labels: StockLocationLabels, separator = " · "): string {
  const parts = [labels.locker, labels.compartment].filter(Boolean);
  return parts.length > 0 ? parts.join(separator) : "";
}
