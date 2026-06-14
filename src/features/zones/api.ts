import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Zona } from "@/types/models";
import { fetchAmbienteById } from "@/features/ambientes/api";

/** Obtiene zonas de un ambiente vía GET /ambientes/:id (incluye zones). */
export const fetchZonesByAmbiente = async (ambienteId: string): Promise<Zona[]> => {
  const ambiente = await fetchAmbienteById(ambienteId);
  return ambiente.zones ?? [];
};

export const updateZone = async (id: string, data: Partial<Zona>) => {
  const res = await apiClient.patch(ENDPOINTS.ZONES.DETAIL(id), data);
  return unwrapData<Zona>(res.data);
};
