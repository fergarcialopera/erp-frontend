import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { asBoolean, asOptionalString } from "@/lib/catalogMap";
import type {
  Brand,
  BrandSupplierLink,
  Category,
  DispensingType,
  DispensingTypeRoleLink,
  OperationalRole,
  Subcategory,
  Supplier,
} from "@/types/models";

function mapCategory(raw: Record<string, unknown>): Category {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    description: asOptionalString(raw.description) ?? null,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapSubcategory(raw: Record<string, unknown>): Subcategory {
  return {
    id: String(raw.id ?? ""),
    category_id: String(raw.category_id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    description: asOptionalString(raw.description) ?? null,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapBrand(raw: Record<string, unknown>): Brand {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapSupplier(raw: Record<string, unknown>): Supplier {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    legal_name: asOptionalString(raw.legal_name) ?? null,
    tax_id: asOptionalString(raw.tax_id) ?? null,
    email: asOptionalString(raw.email) ?? null,
    phone: asOptionalString(raw.phone) ?? null,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapDispensingType(raw: Record<string, unknown>): DispensingType {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    description: asOptionalString(raw.description) ?? null,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapOperationalRole(raw: Record<string, unknown>): OperationalRole {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: asOptionalString(raw.slug) ?? undefined,
    description: asOptionalString(raw.description) ?? null,
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapBrandSupplier(raw: Record<string, unknown>): BrandSupplierLink {
  return {
    id: String(raw.id ?? ""),
    brand_id: String(raw.brand_id ?? ""),
    supplier_id: String(raw.supplier_id ?? ""),
    supplier_name: String(raw.supplier_name ?? ""),
    is_active: asBoolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

function mapDispensingTypeRole(raw: Record<string, unknown>): DispensingTypeRoleLink {
  return {
    id: String(raw.id ?? ""),
    dispensing_type_id: String(raw.dispensing_type_id ?? ""),
    role_id: String(raw.role_id ?? ""),
    role_name: String(raw.role_name ?? ""),
    role_slug: asOptionalString(raw.role_slug) ?? undefined,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

export type CatalogActiveFilter = { active?: boolean };

// --- Categories ---

export const fetchCategories = async (params?: CatalogActiveFilter): Promise<Category[]> => {
  const res = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapCategory);
};

export const getCategory = async (id: string): Promise<Category> => {
  const res = await apiClient.get(ENDPOINTS.CATEGORIES.DETAIL(id));
  return mapCategory(unwrapData<Record<string, unknown>>(res.data));
};

export const createCategory = async (data: {
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<Category> => {
  const res = await apiClient.post(ENDPOINTS.CATEGORIES.CREATE, data);
  return mapCategory(unwrapData<Record<string, unknown>>(res.data));
};

export const updateCategory = async (
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    is_active: boolean;
  }>,
): Promise<Category> => {
  const res = await apiClient.patch(ENDPOINTS.CATEGORIES.DETAIL(id), data);
  return mapCategory(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.CATEGORIES.DETAIL(id));
};

// --- Subcategories ---

export const fetchSubcategories = async (params?: {
  active?: boolean;
  category_id?: string;
}): Promise<Subcategory[]> => {
  const query: Record<string, string | boolean> = {};
  if (params?.active !== undefined) query.active = params.active;
  if (params?.category_id) query.category_id = params.category_id;
  const res = await apiClient.get(ENDPOINTS.SUBCATEGORIES.LIST, {
    params: Object.keys(query).length ? query : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapSubcategory);
};

export const getSubcategory = async (id: string): Promise<Subcategory> => {
  const res = await apiClient.get(ENDPOINTS.SUBCATEGORIES.DETAIL(id));
  return mapSubcategory(unwrapData<Record<string, unknown>>(res.data));
};

export const createSubcategory = async (data: {
  category_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<Subcategory> => {
  const res = await apiClient.post(ENDPOINTS.SUBCATEGORIES.CREATE, data);
  return mapSubcategory(unwrapData<Record<string, unknown>>(res.data));
};

export const updateSubcategory = async (
  id: string,
  data: Partial<{
    category_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
  }>,
): Promise<Subcategory> => {
  const res = await apiClient.patch(ENDPOINTS.SUBCATEGORIES.DETAIL(id), data);
  return mapSubcategory(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteSubcategory = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.SUBCATEGORIES.DETAIL(id));
};

// --- Brands ---

export const fetchBrands = async (params?: CatalogActiveFilter): Promise<Brand[]> => {
  const res = await apiClient.get(ENDPOINTS.BRANDS.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapBrand);
};

export const getBrand = async (id: string): Promise<Brand> => {
  const res = await apiClient.get(ENDPOINTS.BRANDS.DETAIL(id));
  return mapBrand(unwrapData<Record<string, unknown>>(res.data));
};

export const createBrand = async (data: {
  name: string;
  is_active?: boolean;
}): Promise<Brand> => {
  const res = await apiClient.post(ENDPOINTS.BRANDS.CREATE, data);
  return mapBrand(unwrapData<Record<string, unknown>>(res.data));
};

export const updateBrand = async (
  id: string,
  data: Partial<{ name: string; is_active: boolean }>,
): Promise<Brand> => {
  const res = await apiClient.patch(ENDPOINTS.BRANDS.DETAIL(id), data);
  return mapBrand(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteBrand = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.BRANDS.DETAIL(id));
};

export const fetchBrandSuppliers = async (brandId: string): Promise<BrandSupplierLink[]> => {
  const res = await apiClient.get(ENDPOINTS.BRANDS.SUPPLIERS(brandId));
  return unwrapList<Record<string, unknown>>(res.data).map(mapBrandSupplier);
};

export const attachSupplierToBrand = async (
  brandId: string,
  payload: { supplier_id: string; is_active?: boolean },
): Promise<BrandSupplierLink> => {
  const res = await apiClient.post(ENDPOINTS.BRANDS.SUPPLIERS(brandId), payload);
  return mapBrandSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const detachSupplierFromBrand = async (
  brandId: string,
  supplierId: string,
): Promise<void> => {
  await apiClient.delete(ENDPOINTS.BRANDS.SUPPLIER(brandId, supplierId));
};

// --- Suppliers ---

export const fetchSuppliers = async (params?: CatalogActiveFilter): Promise<Supplier[]> => {
  const res = await apiClient.get(ENDPOINTS.SUPPLIERS.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapSupplier);
};

export const getSupplier = async (id: string): Promise<Supplier> => {
  const res = await apiClient.get(ENDPOINTS.SUPPLIERS.DETAIL(id));
  return mapSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const createSupplier = async (data: {
  name: string;
  legal_name?: string | null;
  tax_id?: string | null;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
}): Promise<Supplier> => {
  const res = await apiClient.post(ENDPOINTS.SUPPLIERS.CREATE, data);
  return mapSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const updateSupplier = async (
  id: string,
  data: Partial<{
    name: string;
    legal_name: string | null;
    tax_id: string | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
  }>,
): Promise<Supplier> => {
  const res = await apiClient.patch(ENDPOINTS.SUPPLIERS.DETAIL(id), data);
  return mapSupplier(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.SUPPLIERS.DETAIL(id));
};

// --- Dispensing types ---

export const fetchDispensingTypes = async (
  params?: CatalogActiveFilter,
): Promise<DispensingType[]> => {
  const res = await apiClient.get(ENDPOINTS.DISPENSING_TYPES.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapDispensingType);
};

export const getDispensingType = async (id: string): Promise<DispensingType> => {
  const res = await apiClient.get(ENDPOINTS.DISPENSING_TYPES.DETAIL(id));
  return mapDispensingType(unwrapData<Record<string, unknown>>(res.data));
};

export const createDispensingType = async (data: {
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<DispensingType> => {
  const res = await apiClient.post(ENDPOINTS.DISPENSING_TYPES.CREATE, data);
  return mapDispensingType(unwrapData<Record<string, unknown>>(res.data));
};

export const updateDispensingType = async (
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    is_active: boolean;
  }>,
): Promise<DispensingType> => {
  const res = await apiClient.patch(ENDPOINTS.DISPENSING_TYPES.DETAIL(id), data);
  return mapDispensingType(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteDispensingType = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.DISPENSING_TYPES.DETAIL(id));
};

export const fetchDispensingTypeRoles = async (
  dispensingTypeId: string,
): Promise<DispensingTypeRoleLink[]> => {
  const res = await apiClient.get(ENDPOINTS.DISPENSING_TYPES.ROLES(dispensingTypeId));
  return unwrapList<Record<string, unknown>>(res.data).map(mapDispensingTypeRole);
};

export const attachRoleToDispensingType = async (
  dispensingTypeId: string,
  roleId: string,
): Promise<DispensingTypeRoleLink> => {
  const res = await apiClient.post(ENDPOINTS.DISPENSING_TYPES.ROLES(dispensingTypeId), {
    role_id: roleId,
  });
  return mapDispensingTypeRole(unwrapData<Record<string, unknown>>(res.data));
};

export const detachRoleFromDispensingType = async (
  dispensingTypeId: string,
  roleId: string,
): Promise<void> => {
  await apiClient.delete(ENDPOINTS.DISPENSING_TYPES.ROLE(dispensingTypeId, roleId));
};

// --- Operational roles ---

export const fetchOperationalRoles = async (
  params?: CatalogActiveFilter,
): Promise<OperationalRole[]> => {
  const res = await apiClient.get(ENDPOINTS.ROLES.LIST, {
    params: params?.active !== undefined ? { active: params.active } : undefined,
  });
  return unwrapList<Record<string, unknown>>(res.data).map(mapOperationalRole);
};

export const getOperationalRole = async (id: string): Promise<OperationalRole> => {
  const res = await apiClient.get(ENDPOINTS.ROLES.DETAIL(id));
  return mapOperationalRole(unwrapData<Record<string, unknown>>(res.data));
};

export const createOperationalRole = async (data: {
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<OperationalRole> => {
  const res = await apiClient.post(ENDPOINTS.ROLES.CREATE, data);
  return mapOperationalRole(unwrapData<Record<string, unknown>>(res.data));
};

export const updateOperationalRole = async (
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    is_active: boolean;
  }>,
): Promise<OperationalRole> => {
  const res = await apiClient.patch(ENDPOINTS.ROLES.DETAIL(id), data);
  return mapOperationalRole(unwrapData<Record<string, unknown>>(res.data));
};

export const deleteOperationalRole = async (id: string): Promise<void> => {
  await apiClient.delete(ENDPOINTS.ROLES.DETAIL(id));
};
