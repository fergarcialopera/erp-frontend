import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { OpenOrder, OpenOrderFilters } from "@/types/models";

/** Cuerpo para solicitar dispensación: POST /inventory/remove (crea Dispense PENDING). */
export interface CreateOpenOrderBody {
  compartment_id: string;
  product_id: string;
  quantity: number;
}

function mapRawDispenseToOpenOrder(d: Record<string, unknown>): OpenOrder {
  return {
    id: String(d.id ?? ""),
    clinic_id: String(d.clinic_id ?? ""),
    requested_by_user_id: String(d.requested_by_user_id ?? ""),
    locker_id: String(d.locker_id ?? ""),
    compartment_id: String(d.compartment_id ?? ""),
    product_id: String(d.product_id ?? ""),
    quantity: Number(d.quantity ?? 0),
    status: (d.status as OpenOrder["status"]) ?? "PENDING",
    requested_at: String(d.requested_at ?? new Date().toISOString()),
    read_at: d.read_at != null ? String(d.read_at) : undefined,
    external_ref: d.external_ref != null ? String(d.external_ref) : "",
    meta: undefined,
  };
}

export const fetchOrders = async (filters?: OpenOrderFilters): Promise<OpenOrder[]> => {
  const params =
    filters?.status != null ? { status: filters.status } : undefined;
  const res = await apiClient.get(ENDPOINTS.DISPENSES.LIST, { params });
  return unwrapList<OpenOrder>(res.data);
};

export const fetchOrderById = async (id: string): Promise<OpenOrder> => {
  const res = await apiClient.get(ENDPOINTS.DISPENSES.DETAIL(id));
  return unwrapData<OpenOrder>(res.data) ?? (res.data as OpenOrder);
};

/**
 * Solicita retirada de stock y crea una dispensación (PENDING), según OpenAPI POST /inventory/remove.
 */
export const createOpenOrder = async (data: CreateOpenOrderBody): Promise<OpenOrder> => {
  const res = await apiClient.post(ENDPOINTS.INVENTORY.REMOVE, {
    compartment_id: data.compartment_id,
    product_id: data.product_id,
    quantity: data.quantity,
  });
  const payload = res.data as {
    dispense?: Record<string, unknown>;
  };
  const d = payload.dispense;
  if (!d || typeof d !== "object") {
    throw new Error("La respuesta no incluye la dispensación creada");
  }
  return mapRawDispenseToOpenOrder(d);
};

export const confirmReadOrder = async (id: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.DISPENSES.CONFIRM_READ(id));
};
