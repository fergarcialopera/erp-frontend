import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductStockLocations } from "./api";

export const useProducts = (
  clinicId: string | null,
  options?: { activeOnly?: boolean; platformScope?: boolean },
) => {
  const activeOnly = options?.activeOnly ?? true;
  const platformScope = options?.platformScope === true;
  return useQuery({
    queryKey: platformScope ? ["products", "platform", activeOnly] : ["products", clinicId, activeOnly],
    queryFn: () => (activeOnly ? fetchProducts({ active: true }) : fetchProducts()),
    enabled: platformScope || !!clinicId,
  });
};

export const useProductStockLocations = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["products", "stock-locations", productId],
    queryFn: () => fetchProductStockLocations(productId!),
    enabled: !!productId,
  });
};
