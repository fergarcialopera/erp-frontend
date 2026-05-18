import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { CompartmentInventory } from "@/types/models";

type InventoryLocationApi = {
  quantity?: number;
  qty_available?: number;
  qty_reserved?: number;
  reserved_quantity?: number;
  compartment?: { id?: string; code?: string; name?: string } | null;
  locker?: { id?: string; code?: string; name?: string } | null;
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

function mapByProductRows(item: InventoryByProductApi): CompartmentInventory[] {
  const product = item.product ?? {};
  const locations = Array.isArray(item.locations) ? item.locations : [];

  return locations.map((location, locationIndex) => {
    const locker = location.locker ?? undefined;
    const compartment = location.compartment ?? undefined;
    const qtyAvailable =
      location.qty_available !== undefined ? location.qty_available : location.quantity;

    return {
      id:
        item.id ??
        `${String(product.id ?? "product")}-${String(compartment?.id ?? "no-comp")}-${String(locker?.id ?? "no-lock")}-${locationIndex}`,
      clinic_id: String(item.clinic_id ?? product.clinic_id ?? ""),
      compartment_id: String(compartment?.id ?? ""),
      product_id: String(product.id ?? ""),
      qty_available: toNumber(qtyAvailable),
      qty_reserved: toNumber(
        location.qty_reserved ?? location.reserved_quantity,
        0,
      ),
      locker_id: locker?.id,
      locker_code: locker?.code,
      locker_name: locker?.name,
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
      locker: locker
        ? {
            id: String(locker.id ?? ""),
            clinic_id: String(item.clinic_id ?? product.clinic_id ?? ""),
            code: String(locker.code ?? locker.name ?? locker.id ?? ""),
            name: String(locker.name ?? locker.code ?? locker.id ?? ""),
            is_active: true,
          }
        : undefined,
      compartment: compartment
        ? {
            id: String(compartment.id ?? ""),
            locker_id: String(locker?.id ?? ""),
            code: String(compartment.code ?? compartment.name ?? compartment.id ?? ""),
            status: "AVAILABLE",
            is_active: true,
          }
        : undefined,
    };
  });
}

export const fetchInventory = async (): Promise<CompartmentInventory[]> => {
  const res = await apiClient.get(ENDPOINTS.INVENTORY.LIST);
  const raw = unwrapList<CompartmentInventory | InventoryByProductApi>(res.data);

  if (!raw.length) return [];

  // Compatibilidad con backend que devuelve inventario agrupado por producto + locations[].
  if ("locations" in raw[0]) {
    return raw.flatMap((item) => mapByProductRows(item as InventoryByProductApi));
  }

  return raw as CompartmentInventory[];
};

export interface AddInventoryBody {
  sku: string;
  name?: string;
  quantity: number;
  note?: string;
}

export const addInventory = async (data: AddInventoryBody) => {
  const payload = {
    sku: data.sku,
    name: data.name,
    quantity: data.quantity,
    note: data.note,
  };
  const res = await apiClient.post(ENDPOINTS.ENTRY_LOGS.CREATE, payload);
  return unwrapData<unknown>(res.data);
};
