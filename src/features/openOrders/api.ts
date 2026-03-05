import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { OpenOrder, OpenOrderFilters } from "@/types/models";

export interface CreateOpenOrderBody {
  locker_id: string;
  compartment_id: string;
  product_id: string;
  quantity: number;
  meta?: Record<string, unknown>;
}

export const fetchOpenOrders = async (filters?: OpenOrderFilters): Promise<OpenOrder[]> => {
  const res = await apiClient.get(ENDPOINTS.OPEN_ORDERS.LIST, { params: filters });
  return unwrapList<OpenOrder>(res.data);
};

export const createOpenOrder = async (data: CreateOpenOrderBody): Promise<OpenOrder> => {
  const res = await apiClient.post(ENDPOINTS.OPEN_ORDERS.CREATE, data);
  return unwrapData<OpenOrder>(res.data);
};

export const confirmReadOpenOrder = async (id: string): Promise<OpenOrder> => {
  const res = await apiClient.post(ENDPOINTS.OPEN_ORDERS.CONFIRM_READ(id));
  return unwrapData<OpenOrder>(res.data);
};
