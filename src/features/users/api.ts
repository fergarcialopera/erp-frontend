import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { User } from "@/types/models";

export const fetchUsers = async (params?: {
  active_only?: boolean;
}): Promise<User[]> => {
  const res = await apiClient.get(ENDPOINTS.USERS.LIST, {
    params:
      params?.active_only !== undefined ? { active_only: params.active_only } : undefined,
  });
  return unwrapList<User>(res.data);
};
export const createUser = async (data: Partial<User>) => {
  const res = await apiClient.post(ENDPOINTS.USERS.CREATE, data);
  return unwrapData<User>(res.data);
};
export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await apiClient.patch(ENDPOINTS.USERS.DETAIL(id), data);
  return unwrapData<User>(res.data);
};
