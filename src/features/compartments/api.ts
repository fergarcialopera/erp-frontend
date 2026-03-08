import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Compartment } from "@/types/models";
import { fetchLockerById } from "@/features/lockers/api";

/** Obtiene compartimentos de un locker vía GET /lockers/:id (incluye compartments). */
export const fetchCompartmentsByLocker = async (lockerId: string): Promise<Compartment[]> => {
  const locker = await fetchLockerById(lockerId);
  return locker.compartments ?? [];
};
export const updateCompartment = async (id: string, data: Partial<Compartment>) => {
  const res = await apiClient.patch(ENDPOINTS.COMPARTMENTS.DETAIL(id), data);
  return unwrapData<Compartment>(res.data);
};
