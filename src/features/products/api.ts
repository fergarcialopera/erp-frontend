import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Product, ProductStockLocations } from "@/types/models";

export function mapProductFromApi(raw: Record<string, unknown>): Product {
  const clinicVisibility = raw.is_visible ?? raw.visible;

  return {
    id: String(raw.id ?? raw.product_id ?? ""),
    clinic_id: String(raw.clinic_id ?? ""),
    sku: String(raw.sku ?? ""),
    name: String(raw.name ?? ""),
    barcode: raw.barcode != null && String(raw.barcode).trim() !== "" ? String(raw.barcode) : undefined,
    is_active: raw.is_active !== false,
    is_visible:
      clinicVisibility === undefined
        ? undefined
        : clinicVisibility === true || clinicVisibility === 1 || clinicVisibility === "1",
  };
}

export const fetchProducts = async (params?: { active?: boolean }): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapProductFromApi);
};

export const getProduct = async (id: string): Promise<Product> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(id));
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const createProduct = async (data: Partial<Product>) => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const res = await apiClient.patch(ENDPOINTS.PRODUCTS.DETAIL(id), data);
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.PRODUCTS.DETAIL(id));
};

export const fetchProductStockLocations = async (
  productId: string,
): Promise<ProductStockLocations> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.STOCK_LOCATIONS(productId));
  return unwrapData<ProductStockLocations>(res.data);
};
