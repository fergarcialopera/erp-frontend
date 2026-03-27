import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Product } from "@/types/models";

export const fetchProducts = async (params?: { active?: boolean }): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Product>(res.data);
};

export const getProduct = async (id: string): Promise<Product> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(id));
  return unwrapData<Product>(res.data);
};

export const createProduct = async (data: Partial<Product>) => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
  return unwrapData<Product>(res.data);
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const res = await apiClient.patch(ENDPOINTS.PRODUCTS.DETAIL(id), data);
  return unwrapData<Product>(res.data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.PRODUCTS.DETAIL(id));
};
