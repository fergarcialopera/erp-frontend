import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./api";

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
