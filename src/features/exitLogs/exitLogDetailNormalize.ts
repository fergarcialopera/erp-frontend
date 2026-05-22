import type {
  ExitLogDetail,
  ExitLogLocationLine,
  ExitLogProductItem,
} from "./api";

function isProductGroupedItem(item: ExitLogProductItem): boolean {
  return Array.isArray(item.locations);
}

/**
 * Normaliza la respuesta GET/POST/PATCH/confirm al formato OpenAPI v2:
 * items[] con un elemento por product_id y locations[] por compartimento.
 */
export function normalizeExitLogDetail(raw: ExitLogDetail): ExitLogDetail {
  const items = raw.items ?? [];
  if (items.length === 0) {
    return { exit_log: raw.exit_log, items: [] };
  }

  if (isProductGroupedItem(items[0])) {
    return {
      exit_log: raw.exit_log,
      items: items.map((item) => ({
        ...item,
        locations: item.locations ?? [],
      })),
    };
  }

  // Compatibilidad con respuesta plana legacy (una fila DB por línea).
  const legacy = items as unknown as Array<{
    id?: string;
    item_id?: string;
    product?: ExitLogProductItem["product"];
    locker?: ExitLogLocationLine["locker"];
    compartment?: ExitLogLocationLine["compartment"];
    requested_quantity?: number;
    confirmed_quantity?: number | null;
    stock_available?: number | null;
  }>;

  const byProduct = new Map<string, ExitLogProductItem>();

  for (const line of legacy) {
    const productId = line.product?.id;
    if (!productId) continue;

    const locationLine: ExitLogLocationLine = {
      item_id: String(line.item_id ?? line.id ?? ""),
      requested_quantity: Number(line.requested_quantity ?? 0),
      confirmed_quantity: line.confirmed_quantity,
      stock_available: line.stock_available,
      locker: line.locker,
      compartment: line.compartment,
    };

    const existing = byProduct.get(productId);
    if (existing) {
      existing.locations.push(locationLine);
      existing.requested_quantity_total =
        (existing.requested_quantity_total ?? 0) + locationLine.requested_quantity;
      continue;
    }

    byProduct.set(productId, {
      product: line.product,
      requested_quantity_total: locationLine.requested_quantity,
      locations: [locationLine],
    });
  }

  return { exit_log: raw.exit_log, items: [...byProduct.values()] };
}

/** Aplana locations de todos los productos (para PATCH y comparación de estructura). */
export function flattenExitLogLocationLines(detail: ExitLogDetail) {
  return detail.items.flatMap((productItem) =>
    (productItem.locations ?? []).map((location) => ({
      productId: productItem.product?.id ?? "",
      compartmentId: location.compartment?.id,
      itemId: location.item_id,
      requestedQuantity: location.requested_quantity,
      confirmedQuantity: location.confirmed_quantity,
      stockAvailable: location.stock_available,
      locker: location.locker,
      compartment: location.compartment,
    })),
  );
}
