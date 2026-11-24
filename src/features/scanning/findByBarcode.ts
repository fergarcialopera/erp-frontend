import { barcodesMatch, normalizeBarcode } from "./normalizeBarcode";

type WithBarcode = {
  barcode?: string | null;
};

/** Busca coincidencia exacta de barcode; si no hay, no hace match parcial. */
export function findExactBarcodeMatch<T extends WithBarcode>(
  items: T[],
  scanned: string,
): T | undefined {
  const code = normalizeBarcode(scanned);
  if (!code) return undefined;
  return items.find((item) => barcodesMatch(item.barcode, code));
}
