import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Compartment } from "@/types/models";
import { fetchAmbienteById } from "@/features/ambientes/api";

/** Obtiene compartimentos de un ambiente vía GET /ambientes/:id (incluye compartments). */
export const fetchCompartmentsByAmbiente = async (ambienteId: string): Promise<Compartment[]> => {
  const ambiente = await fetchAmbienteById(ambienteId);
  return ambiente.compartments ?? [];
};

export const updateCompartment = async (id: string, data: Partial<Compartment>) => {
  const res = await apiClient.patch(ENDPOINTS.COMPARTMENTS.DETAIL(id), data);
  return unwrapData<Compartment>(res.data);
};
