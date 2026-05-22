import { useMemo } from "react";
import { useProducts } from "@/features/products/queries";
import { useInventory } from "@/features/inventory/queries";
import type { ProductSearchItem } from "./types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function useProductSearch(clinicId: string | null, search: string) {
  const { data: products = [], isLoading: loadingProducts } = useProducts(clinicId, { activeOnly: true });
  const { data: inventory = [], isLoading: loadingInventory } = useInventory(clinicId);

  const availableByProductId = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((row) => {
      const productId = row.product_id ?? row.product?.id;
      if (!productId) return;
      const available = Number(row.qty_available ?? 0);
      map.set(productId, (map.get(productId) ?? 0) + available);
    });
    return map;
  }, [inventory]);

  const results = useMemo<ProductSearchItem[]>(() => {
    const query = normalizeText(search);
    const rows = products.map((p) => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      barcode: p.barcode,
      availableStock: availableByProductId.get(p.id) ?? 0,
    }));

    // UX: no mostramos listado si el usuario aún no ha escrito.
    // A partir de 2 caracteres, sugerimos productos priorizando stock > 0.
    if (query.length < 2) return [];

    const matches = rows.filter((p) => {
      const haystack = `${p.name} ${p.sku} ${p.barcode ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });

    const withStock = matches.filter((p) => p.availableStock > 0);
    const withoutStock = matches.filter((p) => p.availableStock <= 0);
    return [...withStock, ...withoutStock].slice(0, 30);
  }, [availableByProductId, products, search]);

  return {
    results,
    isLoading: loadingProducts || loadingInventory,
  };
}
