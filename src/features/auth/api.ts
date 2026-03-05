import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";

/** Respuesta de login según api-docs: puede ser { access_token, token_type, user? } o { data: { ... } }. */
export const login = async (data: Record<string, string>) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  return unwrapData<Record<string, unknown>>(res.data) ?? res.data;
};
export const logout = async () => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
};
