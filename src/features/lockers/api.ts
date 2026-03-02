import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { Locker } from "@/types/models";

export const fetchLockers = async (): Promise<Locker[]> => {
  const res = await apiClient.get(ENDPOINTS.LOCKERS.LIST);
  return res.data;
};
export const createLocker = async (data: Partial<Locker>) => {
  const res = await apiClient.post(ENDPOINTS.LOCKERS.CREATE, data);
  return res.data;
};
export const updateLocker = async (id: string, data: Partial<Locker>) => {
  const res = await apiClient.patch(ENDPOINTS.LOCKERS.DETAIL(id), data);
  return res.data;
};
