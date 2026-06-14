import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { CompartmentInventory, ProductStockLocations } from "@/types/models";

export interface AdjustProductInventoryLocation {
  quantity: number;
  compartment_id?: string | null;
}

export interface AdjustProductInventoryBody {
  locations: AdjustProductInventoryLocation[];
}

type InventoryLocationApi = {
  quantity?: number;
  qty_available?: number;
  qty_reserved?: number;
  reserved_quantity?: number;
  compartment?: { id?: string; code?: string; name?: string } | null;
  ambiente?: { id?: string; name?: string; device_id?: string | null } | null;
};

type InventoryProductApi = {
  id?: string;
  clinic_id?: string;
  sku?: string;
  name?: string;
  is_active?: boolean;
};

type InventoryByProductApi = {
  id?: string;
  clinic_id?: string;
  product?: InventoryProductApi | null;
  quantity_total?: number;
  locations?: InventoryLocationApi[] | null;
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isGroupedByProduct(row: unknown): row is InventoryByProductApi {
  return Array.isArray((row as InventoryByProductApi)?.locations);
}

/** Clave estable para React; el API puede repetir item.id / product.id entre ubicaciones. */
function stableInventoryRowKey(row: CompartmentInventory, index: number): string {
  const productId = row.product_id || row.product?.id || "";
  const compartmentId = row.compartment_id || row.compartment?.id || "";
  const ambienteId = row.ambiente_id || row.ambiente?.id || "";
  if (productId || compartmentId || ambienteId) {
    return [productId || "_", compartmentId || "_", ambienteId || "_", String(index)].join(":");
  }
  return row.id ? `${row.id}:${index}` : `inventory-row:${index}`;
}

function mapByProductRows(item: InventoryByProductApi): CompartmentInventory[] {
  const product = item.product ?? {};
  const locations = Array.isArray(item.locations) ? item.locations : [];

  return locations.map((location) => {
    const ambiente = location.ambiente ?? undefined;
    const compartment = location.compartment ?? undefined;
    const qtyAvailable =
      location.qty_available !== undefined ? location.qty_available : location.quantity;

    return {
      id: "",
      clinic_id: String(item.clinic_id ?? product.clinic_id ?? ""),
      compartment_id: String(compartment?.id ?? ""),
      product_id: String(product.id ?? ""),
      qty_available: toNumber(qtyAvailable),
      qty_reserved: toNumber(
        location.qty_reserved ?? location.reserved_quantity,
        0,
      ),
      ambiente_id: ambiente?.id,
      ambiente_name: ambiente?.name,
      compartment_code: compartment?.code,
      compartment_name: compartment?.name,
      product_name: product.name,
      product_sku: product.sku,
      product: {
        id: String(product.id ?? ""),
        clinic_id: String(product.clinic_id ?? item.clinic_id ?? ""),
        sku: String(product.sku ?? ""),
        name: String(product.name ?? ""),
        is_active: product.is_active !== false,
      },
      ambiente: ambiente
        ? {
            id: String(ambiente.id ?? ""),
            clinic_id: String(item.clinic_id ?? product.clinic_id ?? ""),
            name: String(ambiente.name ?? ambiente.id ?? ""),
            device_id: ambiente.device_id ?? undefined,
            is_active: true,
          }
        : undefined,
      compartment: compartment
        ? {
            id: String(compartment.id ?? ""),
            ambiente_id: String(ambiente?.id ?? ""),
            code: String(compartment.code ?? compartment.name ?? compartment.id ?? ""),
            status: "AVAILABLE",
            is_active: true,
          }
        : undefined,
    };
  });
}

/** PATCH /inventory/products/{product_id} — ajuste de cantidades por ubicación (ADMIN). */
export const adjustProductInventory = async (
  productId: string,
  data: AdjustProductInventoryBody,
): Promise<ProductStockLocations> => {
  const res = await apiClient.patch(ENDPOINTS.INVENTORY.ADJUST_PRODUCT(productId), data);
  return unwrapData<ProductStockLocations>(res.data);
};

export const fetchInventory = async (): Promise<CompartmentInventory[]> => {
  const res = await apiClient.get(ENDPOINTS.INVENTORY.LIST);
  const raw = unwrapList<CompartmentInventory | InventoryByProductApi>(res.data);

  if (!raw.length) return [];

  const rows = raw.flatMap((entry) =>
    isGroupedByProduct(entry) ? mapByProductRows(entry) : [entry as CompartmentInventory],
  );

  return rows.map((row, index) => ({
    ...row,
    id: stableInventoryRowKey(row, index),
  }));
};
