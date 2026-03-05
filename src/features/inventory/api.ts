import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { CompartmentInventory, InventoryFilters } from "@/types/models";

export const fetchInventory = async (
  filters?: InventoryFilters,
): Promise<CompartmentInventory[]> => {
  const res = await apiClient.get(ENDPOINTS.INVENTORY.LIST, { params: filters });
  return unwrapList<CompartmentInventory>(res.data);
};

export interface AdjustInventoryBody {
  compartment_id: string;
  product_id: string;
  quantity_delta: number;
  reason?: string;
}

export const adjustInventory = async (data: AdjustInventoryBody) => {
  const res = await apiClient.post(ENDPOINTS.INVENTORY.ADJUST, data);
  return unwrapData<unknown>(res.data);
};
