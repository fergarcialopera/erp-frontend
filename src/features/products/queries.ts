import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductStockLocations } from "./api";

export const useProducts = (
  clinicId: string | null,
  options?: { activeOnly?: boolean }
) => {
  const activeOnly = options?.activeOnly ?? true;
  return useQuery({
    queryKey: ["products", clinicId, activeOnly],
    queryFn: () => (activeOnly ? fetchProducts({ active: true }) : fetchProducts()),
    enabled: !!clinicId,
  });
};

export const useProductStockLocations = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["products", "stock-locations", productId],
    queryFn: () => fetchProductStockLocations(productId!),
    enabled: !!productId,
  });
};
