import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { mapProductFromApi } from "@/features/products/api";
import { Clinic, ClinicAssignableRole, Product } from "@/types/models";

export interface ClinicListItem extends Clinic {
  visible?: boolean;
  has_password?: boolean;
  image_path?: string | null;
  image_url?: string | null;
  display_initial?: string;
  created_at?: string;
}

export interface ClinicWritePayload {
  name: string;
  visible?: boolean;
  password?: string;
}

export interface ClinicUser {
  id: string;
  clinic_id: string | null;
  clinic_ids?: string[];
  name: string;
  email: string;
  role: ClinicAssignableRole;
  is_active: boolean;
  operational_role_id?: string | null;
}

export interface ClinicAmbienteItem {
  id: string;
  name: string;
  location?: string | null;
  device_id?: string | null;
  is_active: boolean;
  /** Visibilidad en esta clínica. */
  visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicUsersQuery {
  is_active?: boolean;
  search?: string;
}

export interface ClinicProductsQuery {
  active?: boolean;
  search?: string;
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
  dispensing_type_id?: string;
  supplier_id?: string;
}

function mapClinicUser(raw: Record<string, unknown>): ClinicUser {
  const role = String(raw.role ?? "STAFF");
  const safeRole: ClinicAssignableRole =
    role === "ADMIN" || role === "TECHNICIAN" || role === "STAFF" ? role : "STAFF";
  return {
    id: String(raw.id ?? ""),
    clinic_id: raw.clinic_id == null ? null : String(raw.clinic_id),
    clinic_ids: Array.isArray(raw.clinic_ids)
      ? raw.clinic_ids.map((id) => String(id))
      : undefined,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: safeRole,
    is_active: raw.is_active !== false,
    operational_role_id:
      raw.operational_role_id == null ? null : String(raw.operational_role_id),
  };
}

function mapClinicAmbiente(raw: Record<string, unknown>): ClinicAmbienteItem {
  const visible = raw.visible ?? raw.is_visible;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    location: raw.location == null ? null : String(raw.location),
    device_id: raw.device_id == null ? null : String(raw.device_id),
    is_active: raw.is_active !== false,
    visible: visible !== false,
    created_at: raw.created_at == null ? undefined : String(raw.created_at),
    updated_at: raw.updated_at == null ? undefined : String(raw.updated_at),
  };
}

export const fetchClinics = async (): Promise<ClinicListItem[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.LIST);
  return unwrapList<ClinicListItem>(res.data);
};

export const fetchClinicById = async (clinicId: string): Promise<ClinicListItem> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.DETAIL(clinicId));
  return unwrapData<ClinicListItem>(res.data);
};

export const createClinic = async (data: ClinicWritePayload): Promise<ClinicListItem> => {
  const res = await apiClient.post(ENDPOINTS.CLINICS.CREATE, data);
  return unwrapData<ClinicListItem>(res.data);
};

export const updateClinic = async (
  clinicId: string,
  data: Partial<ClinicWritePayload>,
): Promise<ClinicListItem> => {
  const res = await apiClient.patch(ENDPOINTS.CLINICS.DETAIL(clinicId), data);
  return unwrapData<ClinicListItem>(res.data);
};

export const fetchClinicUsers = async (
  clinicId: string,
  params?: ClinicUsersQuery,
): Promise<ClinicUser[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.USERS(clinicId), { params });
  return unwrapList<Record<string, unknown>>(res.data).map(mapClinicUser);
};

export const fetchClinicUsersAvailable = async (
  clinicId: string,
  params?: { search?: string },
): Promise<ClinicUser[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.USERS_AVAILABLE(clinicId), { params });
  return unwrapList<Record<string, unknown>>(res.data).map(mapClinicUser);
};

export const assignUserToClinic = async (
  clinicId: string,
  userId: string,
): Promise<ClinicUser> => {
  const res = await apiClient.post(ENDPOINTS.CLINICS.USERS(clinicId), { user_id: userId });
  return mapClinicUser(unwrapData<Record<string, unknown>>(res.data));
};

export const patchClinicUserAccess = async (
  clinicId: string,
  userId: string,
  isActive: boolean,
): Promise<ClinicUser> => {
  const res = await apiClient.patch(ENDPOINTS.CLINICS.USER(clinicId, userId), {
    is_active: isActive,
  });
  return mapClinicUser(unwrapData<Record<string, unknown>>(res.data));
};

export const fetchClinicProducts = async (
  clinicId: string,
  params?: ClinicProductsQuery,
): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.PRODUCTS(clinicId), { params });
  return unwrapList<Record<string, unknown>>(res.data).map(mapProductFromApi);
};

export interface ClinicProductVisibilityBulkPayload {
  visible: boolean;
  only_active_catalog?: boolean;
  product_ids?: string[] | null;
}

export interface ClinicProductVisibilityBulkResult {
  clinic_id: string;
  visible: boolean;
  matched: number;
  updated: number;
  unchanged: number;
}

export const bulkPatchClinicProductVisibility = async (
  clinicId: string,
  data: ClinicProductVisibilityBulkPayload,
): Promise<ClinicProductVisibilityBulkResult> => {
  const res = await apiClient.patch(ENDPOINTS.CLINICS.PRODUCTS(clinicId), data);
  const raw = unwrapData<Record<string, unknown>>(res.data);
  return {
    clinic_id: String(raw.clinic_id ?? clinicId),
    visible: raw.visible === true,
    matched: Number(raw.matched ?? 0),
    updated: Number(raw.updated ?? 0),
    unchanged: Number(raw.unchanged ?? 0),
  };
};

export const fetchClinicAmbientes = async (
  clinicId: string,
  params?: { active?: boolean },
): Promise<ClinicAmbienteItem[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.AMBIENTES(clinicId), { params });
  return unwrapList<Record<string, unknown>>(res.data).map(mapClinicAmbiente);
};

export interface ClinicProductSettingsPayload {
  visible: boolean;
}

export interface ClinicSettingsRequestOptions {
  /** Solo para SUPER_ADMIN sin clínica activa en el token. */
  superAdminClinicId?: string;
}

export const patchClinicProductSettings = async (
  productId: string,
  data: ClinicProductSettingsPayload,
  options?: ClinicSettingsRequestOptions,
): Promise<Product> => {
  const res = await apiClient.patch(ENDPOINTS.CLINIC.PRODUCT(productId), {
    visible: data.visible,
    ...(options?.superAdminClinicId ? { clinic_id: options.superAdminClinicId } : {}),
  });
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const patchClinicProductSettingsByClinic = async (
  clinicId: string,
  productId: string,
  data: ClinicProductSettingsPayload,
): Promise<Product> => {
  const res = await apiClient.patch(ENDPOINTS.CLINICS.PRODUCT(clinicId, productId), data);
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export interface ClinicAmbienteSettingsPayload {
  visible?: boolean;
  active?: boolean;
}

export const patchClinicAmbienteSettings = async (
  ambienteId: string,
  data: ClinicAmbienteSettingsPayload,
  options?: ClinicSettingsRequestOptions,
): Promise<void> => {
  await apiClient.patch(ENDPOINTS.CLINIC.AMBIENTE(ambienteId), {
    ...data,
    ...(options?.superAdminClinicId ? { clinic_id: options.superAdminClinicId } : {}),
  });
};

export const patchClinicAmbienteSettingsByClinic = async (
  clinicId: string,
  ambienteId: string,
  data: ClinicAmbienteSettingsPayload,
): Promise<void> => {
  await apiClient.patch(ENDPOINTS.CLINICS.AMBIENTE(clinicId, ambienteId), data);
};

export const associateAmbienteToClinic = async (
  clinicId: string,
  ambienteId: string,
): Promise<void> => {
  await apiClient.post(ENDPOINTS.CLINICS.ASSOCIATE_AMBIENTE(clinicId), { ambiente_id: ambienteId });
};

export const disassociateAmbienteFromClinic = async (
  clinicId: string,
  ambienteId: string,
): Promise<void> => {
  await apiClient.delete(ENDPOINTS.CLINICS.DISASSOCIATE_AMBIENTE(clinicId, ambienteId));
};

export const getMyClinic = async (): Promise<Clinic> => {
  const res = await apiClient.get(ENDPOINTS.CLINIC.GET);
  return unwrapData<Clinic>(res.data);
};
