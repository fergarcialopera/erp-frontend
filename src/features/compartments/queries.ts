import { useQuery } from "@tanstack/react-query";
import { fetchCompartmentsByLocker } from "./api";

export const useCompartments = (lockerId: string | null) => {
  return useQuery({
    queryKey: ["compartments", lockerId],
    queryFn: () => fetchCompartmentsByLocker(lockerId!),
    enabled: !!lockerId,
  });
};
