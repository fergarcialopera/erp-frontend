import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./api";

export const useProducts = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["products", clinicId],
    queryFn: fetchProducts,
    enabled: !!clinicId,
  });
};
