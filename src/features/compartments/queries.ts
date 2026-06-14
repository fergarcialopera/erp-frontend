import { useQuery } from "@tanstack/react-query";
import { fetchCompartmentsByAmbiente } from "./api";

export const useCompartments = (ambienteId: string | null) => {
  return useQuery({
    queryKey: ["compartments", ambienteId],
    queryFn: () => fetchCompartmentsByAmbiente(ambienteId!),
    enabled: !!ambienteId,
  });
};
