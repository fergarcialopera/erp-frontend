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

export const fetchOrders = async (filters?: OpenOrderFilters): Promise<OpenOrder[]> => {
  const res = await apiClient.get(ENDPOINTS.ORDERS.LIST, { params: filters });
  return unwrapList<OpenOrder>(res.data);
};

export const fetchOrderById = async (id: string): Promise<OpenOrder> => {
  const res = await apiClient.get(ENDPOINTS.ORDERS.DETAIL(id));
  return unwrapData<OpenOrder>(res.data);
};

export const createOpenOrder = async (data: CreateOpenOrderBody): Promise<OpenOrder> => {
  const res = await apiClient.post(ENDPOINTS.ORDERS.CREATE, data);
  return unwrapData<OpenOrder>(res.data);
};

export const confirmReadOrder = async (id: string): Promise<OpenOrder> => {
  const res = await apiClient.post(ENDPOINTS.ORDERS.CONFIRM_READ(id));
  return unwrapData<OpenOrder>(res.data);
};
