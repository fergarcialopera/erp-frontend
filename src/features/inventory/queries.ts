import { useQuery } from "@tanstack/react-query";
import { fetchInventory } from "./api";

export const useInventory = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["inventory", clinicId],
    queryFn: fetchInventory,
    enabled: !!clinicId,
  });
};
