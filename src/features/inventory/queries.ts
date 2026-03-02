import { useQuery } from "@tanstack/react-query";
import type { InventoryFilters } from "@/types/models";
import { fetchInventory } from "./api";

export const useInventory = (clinicId: string | null, filters?: InventoryFilters) => {
  return useQuery({
    queryKey: ["inventory", clinicId, filters],
    queryFn: () => fetchInventory(filters),
    enabled: !!clinicId,
  });
};
