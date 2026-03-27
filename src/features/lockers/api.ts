import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Locker } from "@/types/models";

export const fetchLockers = async (params?: {
  active?: boolean;
}): Promise<Locker[]> => {
  const res = await apiClient.get(ENDPOINTS.LOCKERS.LIST, {
    params:
      params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Locker>(res.data);
};

export const fetchLockerById = async (id: string): Promise<Locker> => {
  const res = await apiClient.get(ENDPOINTS.LOCKERS.DETAIL(id));
  return unwrapData<Locker>(res.data);
};
export const createLocker = async (data: Partial<Locker>) => {
  const res = await apiClient.post(ENDPOINTS.LOCKERS.CREATE, data);
  return unwrapData<Locker>(res.data);
};
export const updateLocker = async (id: string, data: Partial<Locker>) => {
  const res = await apiClient.patch(ENDPOINTS.LOCKERS.DETAIL(id), data);
  return unwrapData<Locker>(res.data);
};
