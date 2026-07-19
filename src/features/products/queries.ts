import { useQuery } from "@tanstack/react-query";
import {
  fetchProductStockLocations,
  fetchProductSuppliers,
  fetchProducts,
  getProduct,
} from "./api";
import type { ProductListFilters } from "@/types/models";

export const useProducts = (
  clinicId: string | null,
  options?: {
    activeOnly?: boolean;
    platformScope?: boolean;
    filters?: ProductListFilters;
  },
) => {
  const activeOnly = options?.activeOnly ?? true;
  const platformScope = options?.platformScope === true;
  const filters: ProductListFilters = {
    ...(options?.filters ?? {}),
  };
  if (activeOnly && filters.active === undefined) {
    filters.active = true;
  }

  const hasFilters = Object.keys(filters).length > 0;

  return useQuery({
    queryKey: platformScope
      ? ["products", "platform", activeOnly, options?.filters]
      : ["products", clinicId, activeOnly, options?.filters],
    queryFn: () => fetchProducts(hasFilters ? filters : undefined),
    enabled: platformScope || !!clinicId,
  });
};

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

export const useProductStockLocations = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["products", "stock-locations", productId],
    queryFn: () => fetchProductStockLocations(productId!),
    enabled: !!productId,
  });
};

export const useProductSuppliers = (productId: string | undefined) =>
  useQuery({
    queryKey: ["products", productId, "suppliers"],
    queryFn: () => fetchProductSuppliers(productId!),
    enabled: !!productId,
  });
