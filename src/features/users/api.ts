import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { User } from "@/types/models";

export const fetchUsers = async (): Promise<User[]> => {
  const res = await apiClient.get(ENDPOINTS.USERS.LIST);
  return res.data;
};
export const createUser = async (data: Partial<User>) => {
  const res = await apiClient.post(ENDPOINTS.USERS.CREATE, data);
  return res.data;
};
export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await apiClient.patch(ENDPOINTS.USERS.DETAIL(id), data);
  return res.data;
};
