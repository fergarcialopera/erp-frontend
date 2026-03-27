import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { CompartmentInventory } from "@/types/models";

export const fetchInventory = async (): Promise<CompartmentInventory[]> => {
  const res = await apiClient.get(ENDPOINTS.INVENTORY.LIST);
  return unwrapList<CompartmentInventory>(res.data);
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
