import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Ambiente, Compartment } from "@/types/models";

type AmbienteTreeCompartmentApi = {
  id?: string;
  ambiente_id?: string;
  code?: string;
  is_active?: boolean;
};

type AmbienteTreeNodeApi = {
  id?: string;
  clinic_id?: string;
  name?: string;
  location?: string | null;
  device_id?: string | null;
  is_active?: boolean;
  compartments?: AmbienteTreeCompartmentApi[] | null;
};

function mapTreeCompartment(raw: AmbienteTreeCompartmentApi): Compartment {
  return {
    id: String(raw.id ?? ""),
    ambiente_id: String(raw.ambiente_id ?? ""),
    code: String(raw.code ?? raw.id ?? ""),
    status: "AVAILABLE",
    is_active: raw.is_active !== false,
  };
}

function mapAmbienteFromApi(raw: AmbienteTreeNodeApi, clinicId: string): Ambiente {
  const compartments = Array.isArray(raw.compartments)
    ? raw.compartments.map(mapTreeCompartment)
    : [];

  return {
    id: String(raw.id ?? ""),
    clinic_id: String(raw.clinic_id ?? clinicId),
    name: String(raw.name ?? ""),
    location: raw.location ?? undefined,
    device_id: raw.device_id ?? undefined,
    is_active: raw.is_active !== false,
    compartments,
  };
}

export const fetchAmbientes = async (params?: {
  active?: boolean;
}): Promise<Ambiente[]> => {
  const res = await apiClient.get(ENDPOINTS.AMBIENTES.LIST, {
    params:
      params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Ambiente>(res.data);
};

export const fetchAmbienteById = async (id: string): Promise<Ambiente> => {
  const res = await apiClient.get(ENDPOINTS.AMBIENTES.DETAIL(id));
  const data = unwrapData<AmbienteTreeNodeApi>(res.data);
  return mapAmbienteFromApi(data, String(data.clinic_id ?? ""));
};

/** GET /ambientes/tree — catálogo con compartimentos anidados (pickers de ubicación). */
export const fetchAmbientesTree = async (
  clinicId: string,
  params?: { active?: boolean },
): Promise<Ambiente[]> => {
  const res = await apiClient.get(ENDPOINTS.AMBIENTES.TREE, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  const raw = unwrapList<AmbienteTreeNodeApi>(res.data);
  return raw.map((node) => mapAmbienteFromApi(node, clinicId));
};

export const createAmbiente = async (data: Partial<Ambiente>) => {
  const res = await apiClient.post(ENDPOINTS.AMBIENTES.CREATE, data);
  return unwrapData<Ambiente>(res.data);
};

export const updateAmbiente = async (id: string, data: Partial<Ambiente>) => {
  const res = await apiClient.patch(ENDPOINTS.AMBIENTES.DETAIL(id), data);
  return unwrapData<Ambiente>(res.data);
};
