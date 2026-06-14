/** Etiquetas de ambiente y zona para mostrar en UI. */
export interface StockLocationLabels {
  ambiente?: string | null;
  zona?: string | null;
}

export interface AmbienteRefLike {
  id?: string;
  name?: string;
  device_id?: string | null;
}

export interface ZonaRefLike {
  id?: string;
  code?: string;
  name?: string;
}

export interface AmbienteFlatFallbacks {
  ambiente_id?: string;
  ambiente_name?: string;
}

export interface ZonaFlatFallbacks {
  zone_id?: string;
  zone_code?: string;
  zone_name?: string;
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

export function resolveZonaLabel(
  zone?: ZonaRefLike | null,
  fallbacks?: ZonaFlatFallbacks,
): string | undefined {
  const label =
    zone?.code?.trim() ||
    zone?.name?.trim() ||
    fallbacks?.zone_code?.trim() ||
    fallbacks?.zone_name?.trim() ||
    fallbacks?.zone_id?.trim();
  return label || undefined;
}

export function resolveStockLocationLabels(
  ambiente?: AmbienteRefLike | null,
  zone?: ZonaRefLike | null,
  fallbacks?: AmbienteFlatFallbacks & ZonaFlatFallbacks,
): StockLocationLabels {
  return {
    ambiente: resolveAmbienteLabel(ambiente, fallbacks),
    zona: resolveZonaLabel(zone, fallbacks),
  };
}

/** Clave estable para deduplicar ubicaciones en listas. */
export function stockLocationKey(labels: StockLocationLabels): string {
  return `${labels.ambiente ?? ""}|${labels.zona ?? ""}`;
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
  const parts = [labels.ambiente, labels.zona].filter(Boolean);
  return parts.length > 0 ? parts.join(separator) : "";
}
