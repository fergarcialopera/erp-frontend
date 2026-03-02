import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";

export const login = async (data: Record<string, string>) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  return res.data;
};
export const logout = async () => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
};
