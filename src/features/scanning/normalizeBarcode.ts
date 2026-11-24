/** Normaliza un código leído por teclado/cámara para comparación. */
export function normalizeBarcode(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

/** Comparación insensible a mayúsculas tras normalizar. */
export function barcodesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalizeBarcode(a).toLowerCase() === normalizeBarcode(b).toLowerCase();
}
