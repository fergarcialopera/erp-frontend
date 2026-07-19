import { useQuery } from "@tanstack/react-query";
import {
  fetchBrandSuppliers,
  fetchBrands,
  fetchCategories,
  fetchDispensingTypeRoles,
  fetchDispensingTypes,
  fetchOperationalRoles,
  fetchSubcategories,
  fetchSuppliers,
  getBrand,
  getCategory,
  getDispensingType,
  getOperationalRole,
  getSubcategory,
  getSupplier,
} from "./api";

export const catalogKeys = {
  categories: (active?: boolean) => ["catalog", "categories", active] as const,
  category: (id: string) => ["catalog", "categories", id] as const,
  subcategories: (filters?: { active?: boolean; category_id?: string }) =>
    ["catalog", "subcategories", filters] as const,
  subcategory: (id: string) => ["catalog", "subcategories", id] as const,
  brands: (active?: boolean) => ["catalog", "brands", active] as const,
  brand: (id: string) => ["catalog", "brands", id] as const,
  brandSuppliers: (brandId: string) => ["catalog", "brands", brandId, "suppliers"] as const,
  suppliers: (active?: boolean) => ["catalog", "suppliers", active] as const,
  supplier: (id: string) => ["catalog", "suppliers", id] as const,
  dispensingTypes: (active?: boolean) => ["catalog", "dispensing-types", active] as const,
  dispensingType: (id: string) => ["catalog", "dispensing-types", id] as const,
  dispensingTypeRoles: (id: string) => ["catalog", "dispensing-types", id, "roles"] as const,
  roles: (active?: boolean) => ["catalog", "roles", active] as const,
  role: (id: string) => ["catalog", "roles", id] as const,
};

export const useCategories = (active?: boolean) =>
  useQuery({
    queryKey: catalogKeys.categories(active),
    queryFn: () => fetchCategories(active !== undefined ? { active } : undefined),
  });

export const useCategory = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.category(id ?? ""),
    queryFn: () => getCategory(id!),
    enabled: !!id,
  });

export const useSubcategories = (filters?: { active?: boolean; category_id?: string }) =>
  useQuery({
    queryKey: catalogKeys.subcategories(filters),
    queryFn: () => fetchSubcategories(filters),
  });

export const useSubcategory = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.subcategory(id ?? ""),
    queryFn: () => getSubcategory(id!),
    enabled: !!id,
  });

export const useBrands = (active?: boolean) =>
  useQuery({
    queryKey: catalogKeys.brands(active),
    queryFn: () => fetchBrands(active !== undefined ? { active } : undefined),
  });

export const useBrand = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.brand(id ?? ""),
    queryFn: () => getBrand(id!),
    enabled: !!id,
  });

export const useBrandSuppliers = (brandId: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.brandSuppliers(brandId ?? ""),
    queryFn: () => fetchBrandSuppliers(brandId!),
    enabled: !!brandId,
  });

export const useSuppliers = (active?: boolean) =>
  useQuery({
    queryKey: catalogKeys.suppliers(active),
    queryFn: () => fetchSuppliers(active !== undefined ? { active } : undefined),
  });

export const useSupplier = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.supplier(id ?? ""),
    queryFn: () => getSupplier(id!),
    enabled: !!id,
  });

export const useDispensingTypes = (active?: boolean) =>
  useQuery({
    queryKey: catalogKeys.dispensingTypes(active),
    queryFn: () => fetchDispensingTypes(active !== undefined ? { active } : undefined),
  });

export const useDispensingType = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.dispensingType(id ?? ""),
    queryFn: () => getDispensingType(id!),
    enabled: !!id,
  });

export const useDispensingTypeRoles = (dispensingTypeId: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.dispensingTypeRoles(dispensingTypeId ?? ""),
    queryFn: () => fetchDispensingTypeRoles(dispensingTypeId!),
    enabled: !!dispensingTypeId,
  });

export const useOperationalRoles = (active?: boolean) =>
  useQuery({
    queryKey: catalogKeys.roles(active),
    queryFn: () => fetchOperationalRoles(active !== undefined ? { active } : undefined),
  });

export const useOperationalRole = (id: string | undefined) =>
  useQuery({
    queryKey: catalogKeys.role(id ?? ""),
    queryFn: () => getOperationalRole(id!),
    enabled: !!id,
  });
