import { useQuery } from "@tanstack/react-query";
import type { OpenOrderFilters } from "@/types/models";
import { fetchOrders, fetchOrderById } from "./api";

export const useOpenOrders = (clinicId: string | null, filters?: OpenOrderFilters) => {
  return useQuery({
    queryKey: ["orders", clinicId, filters],
    queryFn: () => fetchOrders(filters),
    enabled: !!clinicId,
  });
};

export const useOrder = (orderId: string | null) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });
};
