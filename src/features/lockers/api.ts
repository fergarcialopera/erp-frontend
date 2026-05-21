import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Compartment, Locker } from "@/types/models";

type LockerTreeCompartmentApi = {
  id?: string;
  locker_id?: string;
  code?: string;
  is_active?: boolean;
  status?: Compartment["status"];
};

type LockerTreeNodeApi = {
  id?: string;
  clinic_id?: string;
  code?: string;
  name?: string;
  location?: string | null;
  device_id?: string | null;
  is_active?: boolean;
  compartments?: LockerTreeCompartmentApi[] | null;
};

function mapTreeCompartment(raw: LockerTreeCompartmentApi): Compartment {
  return {
    id: String(raw.id ?? ""),
    locker_id: String(raw.locker_id ?? ""),
    code: String(raw.code ?? raw.id ?? ""),
    status: raw.status === "MAINTENANCE" ? "MAINTENANCE" : "AVAILABLE",
    is_active: raw.is_active !== false,
  };
}

function mapLockerTreeNode(raw: LockerTreeNodeApi, clinicId: string): Locker {
  const name = String(raw.name ?? "");
  const code = String(raw.code ?? (name || raw.id) ?? "");
  const compartments = Array.isArray(raw.compartments)
    ? raw.compartments.map(mapTreeCompartment)
    : [];

  return {
    id: String(raw.id ?? ""),
    clinic_id: String(raw.clinic_id ?? clinicId),
    code,
    name: name || code,
    location: raw.location ?? undefined,
    is_active: raw.is_active !== false,
    compartments,
  };
}

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

/** GET /lockers/tree — catálogo con compartimentos anidados (pickers de ubicación). */
export const fetchLockersTree = async (
  clinicId: string,
  params?: { active?: boolean },
): Promise<Locker[]> => {
  const res = await apiClient.get(ENDPOINTS.LOCKERS.TREE, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  const raw = unwrapList<LockerTreeNodeApi>(res.data);
  return raw.map((node) => mapLockerTreeNode(node, clinicId));
};
export const createLocker = async (data: Partial<Locker>) => {
  const res = await apiClient.post(ENDPOINTS.LOCKERS.CREATE, data);
  return unwrapData<Locker>(res.data);
};
export const updateLocker = async (id: string, data: Partial<Locker>) => {
  const res = await apiClient.patch(ENDPOINTS.LOCKERS.DETAIL(id), data);
  return unwrapData<Locker>(res.data);
};
