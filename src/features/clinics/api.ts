import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { mapProductFromApi } from "@/features/products/api";
import { Clinic, Product } from "@/types/models";

export interface ClinicListItem extends Clinic {
  visible?: boolean;
}

export interface ClinicWritePayload {
  name: string;
  visible?: boolean;
  password?: string;
}

export const fetchClinics = async (): Promise<ClinicListItem[]> => {
  const res = await apiClient.get(ENDPOINTS.CLINICS.LIST);
  return unwrapList<ClinicListItem>(res.data);
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
