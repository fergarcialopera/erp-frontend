import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { getAccessToken, getClinicAccessToken } from "@/lib/authStorage";
import { withAuthMode } from "@/lib/authRequest";
import { ENDPOINTS } from "@/config/endpoints";
import { LOGIN_FORMAT, LOGIN_USER_FIELD } from "@/config/env";
import {
  AuthClinicSummary,
  AuthStaffMember,
  ClinicLoginResult,
  UserLoginResult,
} from "@/types/auth";
import { User } from "@/types/models";
import { parseUserFromLoginResponse } from "./parseLoginUser";

function mapClinicSummary(raw: Record<string, unknown>): AuthClinicSummary {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    image_url: (raw.image_url as string | null) ?? null,
    display_initial: String(raw.display_initial ?? raw.name ?? "?").charAt(0).toUpperCase(),
    visible: raw.visible as boolean | undefined,
  };
}

function mapStaffMember(raw: Record<string, unknown>): AuthStaffMember {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    role: (raw.role === "ADMIN" || raw.role === "TECHNICIAN" || raw.role === "STAFF"
      ? raw.role
      : "STAFF") as AuthStaffMember["role"],
    image_url: (raw.image_url as string | null) ?? null,
    display_initial: String(raw.display_initial ?? raw.name ?? "?").charAt(0).toUpperCase(),
  };
}

function parseUserLoginPayload(data: Record<string, unknown>): UserLoginResult {
  const access_token = String(data.access_token ?? data.token ?? "");
  if (!access_token) {
    throw new Error("La respuesta no incluye token de usuario");
  }
  const resUser = data.user as Record<string, unknown> | undefined;
  const user = parseUserFromLoginResponse(access_token, resUser);
  return {
    access_token,
    user,
    expires_in: data.expires_in as number | undefined,
  };
}

export const fetchVisibleClinics = async (): Promise<AuthClinicSummary[]> => {
  const res = await apiClient.get(ENDPOINTS.AUTH.CLINICS, withAuthMode("none"));
  const list = unwrapList<Record<string, unknown>>(res.data);
  return list
    .map(mapClinicSummary)
    .filter((c) => c.visible !== false);
};

export const loginClinic = async (
  clinicId: string,
  password: string,
): Promise<ClinicLoginResult> => {
  const res = await apiClient.post(
    ENDPOINTS.AUTH.CLINIC_LOGIN,
    { clinic_id: clinicId, password },
    withAuthMode("none"),
  );
  const data = (unwrapData<Record<string, unknown>>(res.data) ?? {}) as Record<string, unknown>;
  const clinic_access_token = String(
    data.clinic_access_token ?? data.access_token ?? "",
  );
  if (!clinic_access_token) {
    throw new Error("La respuesta no incluye token de clínica");
  }
  const clinicRaw = (data.clinic ?? data) as Record<string, unknown>;
  const clinic = mapClinicSummary({
    ...clinicRaw,
    id: clinicRaw.id ?? clinicId,
  });
  return {
    clinic_access_token,
    clinic,
    expires_in: data.expires_in as number | undefined,
  };
};

export const fetchStaff = async (): Promise<AuthStaffMember[]> => {
  const res = await apiClient.get(ENDPOINTS.AUTH.STAFF, withAuthMode("clinic"));
  return unwrapList<Record<string, unknown>>(res.data).map(mapStaffMember);
};

export const loginWithPin = async (userId: string, pin: string): Promise<UserLoginResult> => {
  const res = await apiClient.post(
    ENDPOINTS.AUTH.LOGIN_PIN,
    { user_id: userId, pin },
    withAuthMode("clinic"),
  );
  const data = (unwrapData<Record<string, unknown>>(res.data) ?? {}) as Record<string, unknown>;
  return parseUserLoginPayload(data);
};

export const loginWithPassword = async (
  email: string,
  password: string,
  options?: { useClinicToken?: boolean },
): Promise<UserLoginResult> => {
  const isForm = LOGIN_FORMAT === "form";
  const body = isForm
    ? new URLSearchParams({
        [LOGIN_USER_FIELD]: email,
        password,
      })
    : { [LOGIN_USER_FIELD]: email, password };
  const config = {
    ...withAuthMode(options?.useClinicToken ? "clinic" : "none"),
    ...(isForm ? { headers: { "Content-Type": "application/x-www-form-urlencoded" } } : {}),
  };
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, body, config);
  const data = (unwrapData<Record<string, unknown>>(res.data) ?? {}) as Record<string, unknown>;
  return parseUserLoginPayload(data);
};

/** Login con token de clínica si existe en almacenamiento (kiosk). */
export const loginWithPasswordAutoClinic = async (
  email: string,
  password: string,
): Promise<UserLoginResult> => {
  const useClinic = !!getClinicAccessToken();
  return loginWithPassword(email, password, { useClinicToken: useClinic });
};

export const logoutUserApi = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT, undefined, withAuthMode("user"));
};

export const logoutClinicApi = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.CLINIC_LOGOUT, undefined, withAuthMode("clinic"));
};

export const fetchMe = async (): Promise<User> => {
  const res = await apiClient.get(ENDPOINTS.AUTH.ME, withAuthMode("user"));
  const data = unwrapData<Record<string, unknown>>(res.data) ?? {};
  return parseUserFromLoginResponse(getAccessToken() ?? "", data);
};

export const requestClinicRecovery = async (email: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.RECOVERY_CLINIC, { email }, withAuthMode("none"));
};

export const requestUserRecovery = async (email: string): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.RECOVERY_USER, { email }, withAuthMode("none"));
};

export type RecoveryConfirmType = "clinic_password" | "user_password" | "user_pin";

export const confirmRecovery = async (
  token: string,
  type: RecoveryConfirmType,
  payload: { password?: string; pin?: string },
): Promise<void> => {
  await apiClient.post(
    ENDPOINTS.AUTH.RECOVERY_CONFIRM,
    { token, type, ...payload },
    withAuthMode("none"),
  );
};
