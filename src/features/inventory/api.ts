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

export interface AddInventoryBody {
  compartment_id: string;
  product_id: string;
  quantity: number;
}

export interface RemoveInventoryBody {
  compartment_id: string;
  product_id: string;
  quantity: number;
}

export const addInventory = async (data: AddInventoryBody) => {
  const res = await apiClient.post(ENDPOINTS.INVENTORY.ADD, data);
  return unwrapData<unknown>(res.data);
};

export const removeInventory = async (data: RemoveInventoryBody) => {
  const res = await apiClient.post(ENDPOINTS.INVENTORY.REMOVE, data);
  return unwrapData<unknown>(res.data);
};

export const deleteInventoryEntry = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.INVENTORY.DELETE(id));
};
