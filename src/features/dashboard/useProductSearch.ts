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

  const inventoryByProductId = useMemo(() => {
    const map = new Map<string, { available: number; location?: string }>();
    inventory.forEach((row) => {
      const productId = row.product_id ?? row.product?.id;
      if (!productId) return;
      const available = Number(row.qty_available ?? 0);
      const locationParts = [
        row.locker_name ?? row.locker?.name ?? row.locker_code ?? row.locker?.code,
        row.compartment_name ?? row.compartment?.code ?? row.compartment_code,
      ].filter(Boolean);
      const current = map.get(productId);
      map.set(productId, {
        available: (current?.available ?? 0) + available,
        location: current?.location ?? (locationParts.length > 0 ? locationParts.join(" / ") : undefined),
      });
    });
    return map;
  }, [inventory]);

  const results = useMemo<ProductSearchItem[]>(() => {
    const query = normalizeText(search);
    const rows = products.map((p) => {
      const inventoryData = inventoryByProductId.get(p.id);
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
        availableStock: inventoryData?.available ?? 0,
        location: inventoryData?.location,
      };
    });

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
  }, [inventoryByProductId, products, search]);

  return {
    results,
    isLoading: loadingProducts || loadingInventory,
  };
}
