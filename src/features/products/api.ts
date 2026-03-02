import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { Product } from "@/types/models";

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.LIST);
  return res.data;
};
export const createProduct = async (data: Partial<Product>) => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
  return res.data;
};
export const updateProduct = async (id: string, data: Partial<Product>) => {
  const res = await apiClient.patch(ENDPOINTS.PRODUCTS.DETAIL(id), data);
  return res.data;
};
