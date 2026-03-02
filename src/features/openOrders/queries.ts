import { useQuery } from "@tanstack/react-query";
import type { OpenOrderFilters } from "@/types/models";
import { fetchOpenOrders } from "./api";

export const useOpenOrders = (clinicId: string | null, filters?: OpenOrderFilters) => {
  return useQuery({
    queryKey: ["openOrders", clinicId, filters],
    queryFn: () => fetchOpenOrders(filters),
    enabled: !!clinicId,
  });
};
