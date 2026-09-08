import type { Product } from "@/types/models";

/**
 * Producto usable en operaciones de la clínica: activo en catálogo y visible
 * (activado) en esa clínica.
 */
export function isClinicOperableProduct(product: Product): boolean {
  return product.is_active === true && product.is_visible === true;
}
