import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Zona } from "@/types/models";
import { fetchAmbienteById } from "@/features/ambientes/api";

/** Obtiene zonas de un ambiente vía GET /ambientes/:id (incluye zones). */
export const fetchZonesByAmbiente = async (ambienteId: string): Promise<Zona[]> => {
  const ambiente = await fetchAmbienteById(ambienteId);
  return ambiente.zones ?? [];
};

export const fetchZones = async (params?: {
  ambiente_id?: string;
  active?: boolean;
}): Promise<Zona[]> => {
  const res = await apiClient.get(ENDPOINTS.ZONES.LIST, {
    params: {
      ...(params?.ambiente_id ? { ambiente_id: params.ambiente_id } : {}),
      ...(params?.active !== undefined ? { active: params.active } : {}),
    },
  });
  return unwrapList<Zona>(res.data);
};

export const createZone = async (data: Pick<Zona, "ambiente_id" | "code"> & { is_active?: boolean }) => {
  const res = await apiClient.post(ENDPOINTS.ZONES.CREATE, data);
  return unwrapData<Zona>(res.data);
};

export const updateZone = async (id: string, data: Partial<Zona>) => {
  const res = await apiClient.patch(ENDPOINTS.ZONES.DETAIL(id), data);
  return unwrapData<Zona>(res.data);
};

export const deleteZone = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.ZONES.DETAIL(id));
};
