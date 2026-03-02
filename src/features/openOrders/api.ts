import { apiClient } from "@/lib/apiClient";
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
  const res = await apiClient.get<OpenOrder[]>(ENDPOINTS.OPEN_ORDERS.LIST, {
    params: filters,
  });
  return res.data;
};

export const createOpenOrder = async (data: CreateOpenOrderBody): Promise<OpenOrder> => {
  const res = await apiClient.post<OpenOrder>(ENDPOINTS.OPEN_ORDERS.CREATE, data);
  return res.data;
};

export const confirmReadOpenOrder = async (id: string): Promise<OpenOrder> => {
  const res = await apiClient.post<OpenOrder>(ENDPOINTS.OPEN_ORDERS.CONFIRM_READ(id));
  return res.data;
};
