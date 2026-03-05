import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Compartment } from "@/types/models";

export const fetchCompartmentsByLocker = async (lockerId: string): Promise<Compartment[]> => {
  const res = await apiClient.get(ENDPOINTS.COMPARTMENTS.LIST_BY_LOCKER(lockerId));
  return unwrapList<Compartment>(res.data);
};
export const updateCompartment = async (id: string, data: Partial<Compartment>) => {
  const res = await apiClient.patch(ENDPOINTS.COMPARTMENTS.DETAIL(id), data);
  return unwrapData<Compartment>(res.data);
};
