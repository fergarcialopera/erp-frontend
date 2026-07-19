import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { asBoolean, asOptionalNumber, asOptionalString, mapCatalogRef } from "@/lib/catalogMap";
import type {
  Product,
  ProductCreatePayload,
  ProductListFilters,
  ProductSupplierLink,
  ProductSupplierPayload,
  ProductUpdatePayload,
  ProductStockLocations,
} from "@/types/models";

function mapProductSupplier(raw: Record<string, unknown>): ProductSupplierLink {
  return {
    id: String(raw.id ?? ""),
    product_id: String(raw.product_id ?? ""),
    supplier_id: String(raw.supplier_id ?? ""),
    name: String(raw.name ?? ""),
    supplier_reference: asOptionalString(raw.supplier_reference) ?? null,
    purchase_price: asOptionalNumber(raw.purchase_price) ?? null,
    pvp: asOptionalNumber(raw.pvp) ?? null,
    net_cost: asOptionalNumber(raw.net_cost) ?? null,
    is_preferred: asBoolean(raw.is_preferred, false),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

export function mapProductFromApi(raw: Record<string, unknown>): Product {
  const clinicVisibility = raw.is_visible ?? raw.visible;
  const suppliersRaw = raw.suppliers;

  return {
    id: String(raw.id ?? raw.product_id ?? ""),
    clinic_id: raw.clinic_id != null ? String(raw.clinic_id) : undefined,
    sku: String(raw.sku ?? ""),
    name: String(raw.name ?? ""),
    barcode: asOptionalString(raw.barcode) ?? null,
    internal_reference: asOptionalString(raw.internal_reference) ?? null,
    category_id: asOptionalString(raw.category_id) ?? null,
    subcategory_id: asOptionalString(raw.subcategory_id) ?? null,
    brand_id: asOptionalString(raw.brand_id) ?? null,
    dispensing_type_id: asOptionalString(raw.dispensing_type_id) ?? null,
    unit_of_measure:
      raw.unit_of_measure != null && String(raw.unit_of_measure).trim() !== ""
        ? String(raw.unit_of_measure)
        : "Unidades",
    is_active: asBoolean(raw.is_active),
    is_visible:
      clinicVisibility === undefined
        ? undefined
        : clinicVisibility === true || clinicVisibility === 1 || clinicVisibility === "1",
    category: mapCatalogRef(raw.category),
    subcategory: mapCatalogRef(raw.subcategory),
    brand: mapCatalogRef(raw.brand),
    dispensing_type: mapCatalogRef(raw.dispensing_type),
    suppliers: Array.isArray(suppliersRaw)
      ? suppliersRaw.map((s) => mapProductSupplier(s as Record<string, unknown>))
      : undefined,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

/** Filtrado cliente de respaldo (p. ej. API antigua o cache parcial). */
export function filterProductsClient(products: Product[], filters?: ProductListFilters): Product[] {
  if (!filters) return products;
  let result = products;

  if (filters.active !== undefined) {
    result = result.filter((p) => p.is_active === filters.active);
  }
  if (filters.category_id) {
    result = result.filter((p) => p.category_id === filters.category_id);
  }
  if (filters.subcategory_id) {
    result = result.filter((p) => p.subcategory_id === filters.subcategory_id);
  }
  if (filters.brand_id) {
    result = result.filter((p) => p.brand_id === filters.brand_id);
  }
  if (filters.dispensing_type_id) {
    result = result.filter((p) => p.dispensing_type_id === filters.dispensing_type_id);
  }
  // El listado API no embebe suppliers; solo filtrar en cliente si algún ítem trae suppliers.
  if (filters.supplier_id && products.some((p) => Array.isArray(p.suppliers))) {
    result = result.filter((p) =>
      (p.suppliers ?? []).some((s) => s.supplier_id === filters.supplier_id),
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((p) => {
      const fields = [p.name, p.barcode, p.internal_reference, p.sku];
      return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
    });
  }
  return result;
}

function buildProductListParams(
  filters?: ProductListFilters,
): Record<string, string | boolean> | undefined {
  if (!filters) return undefined;
  const params: Record<string, string | boolean> = {};
  if (filters.active !== undefined) params.active = filters.active;
  if (filters.category_id) params.category_id = filters.category_id;
  if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
  if (filters.brand_id) params.brand_id = filters.brand_id;
  if (filters.dispensing_type_id) params.dispensing_type_id = filters.dispensing_type_id;
  if (filters.supplier_id) params.supplier_id = filters.supplier_id;
  if (filters.search?.trim()) params.search = filters.search.trim();
  return Object.keys(params).length ? params : undefined;
}

export const fetchProducts = async (filters?: ProductListFilters): Promise<Product[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
    params: buildProductListParams(filters),
  });
  const mapped = unwrapList<Record<string, unknown>>(res.data).map(mapProductFromApi);
  // Respaldo cliente por si la API aún no aplica algún filtro (p. ej. despliegue parcial).
  return filterProductsClient(mapped, filters);
};

export const getProduct = async (id: string): Promise<Product> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.DETAIL(id));
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const createProduct = async (data: ProductCreatePayload): Promise<Product> => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, data);
  return mapProductFromApi(unwrapData<Record<string, unknown>>(res.data));
};

export const updateProduct = async (id: string, data: ProductUpdatePayload): Promise<Product> => {
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

export const fetchProductSuppliers = async (productId: string): Promise<ProductSupplierLink[]> => {
  const res = await apiClient.get(ENDPOINTS.PRODUCTS.SUPPLIERS(productId));
  return unwrapList<Record<string, unknown>>(res.data).map(mapProductSupplier);
};

export const addProductSupplier = async (
  productId: string,
  payload: ProductSupplierPayload,
): Promise<ProductSupplierLink> => {
  const res = await apiClient.post(ENDPOINTS.PRODUCTS.SUPPLIERS(productId), payload);
  return mapProductSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const updateProductSupplier = async (
  productId: string,
  productSupplierId: string,
  payload: Partial<ProductSupplierPayload>,
): Promise<ProductSupplierLink> => {
  const res = await apiClient.patch(
    ENDPOINTS.PRODUCTS.SUPPLIER(productId, productSupplierId),
    payload,
  );
  return mapProductSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteProductSupplier = async (
  productId: string,
  productSupplierId: string,
): Promise<void> => {
  await apiClient.delete(ENDPOINTS.PRODUCTS.SUPPLIER(productId, productSupplierId));
};

export const setPreferredProductSupplier = async (
  productId: string,
  productSupplierId: string,
): Promise<ProductSupplierLink> => {
  const res = await apiClient.patch(
    ENDPOINTS.PRODUCTS.SUPPLIER_PREFERRED(productId, productSupplierId),
  );
  return mapProductSupplier(unwrapData<Record<string, unknown>>(res.data));
};
