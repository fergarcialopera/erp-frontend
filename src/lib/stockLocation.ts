/** Etiquetas de ambiente y compartimento para mostrar en UI. */
export interface StockLocationLabels {
  ambiente?: string | null;
  compartment?: string | null;
}

export interface AmbienteRefLike {
  id?: string;
  name?: string;
  device_id?: string | null;
}

export interface CompartmentRefLike {
  id?: string;
  code?: string;
  name?: string;
}

export interface AmbienteFlatFallbacks {
  ambiente_id?: string;
  ambiente_name?: string;
}

export interface CompartmentFlatFallbacks {
  compartment_id?: string;
  compartment_code?: string;
  compartment_name?: string;
}

export function resolveAmbienteLabel(
  ambiente?: AmbienteRefLike | null,
  fallbacks?: AmbienteFlatFallbacks,
): string | undefined {
  const label =
    ambiente?.name?.trim() ||
    ambiente?.device_id?.trim() ||
    fallbacks?.ambiente_name?.trim() ||
    fallbacks?.ambiente_id?.trim();
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
  ambiente?: AmbienteRefLike | null,
  compartment?: CompartmentRefLike | null,
  fallbacks?: AmbienteFlatFallbacks & CompartmentFlatFallbacks,
): StockLocationLabels {
  return {
    ambiente: resolveAmbienteLabel(ambiente, fallbacks),
    compartment: resolveCompartmentLabel(compartment, fallbacks),
  };
}

/** Clave estable para deduplicar ubicaciones en listas. */
export function stockLocationKey(labels: StockLocationLabels): string {
  return `${labels.ambiente ?? ""}|${labels.compartment ?? ""}`;
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
  const parts = [labels.ambiente, labels.compartment].filter(Boolean);
  return parts.length > 0 ? parts.join(separator) : "";
}
