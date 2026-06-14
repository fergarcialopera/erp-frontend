import { useQuery } from "@tanstack/react-query";
import { fetchZonesByAmbiente } from "./api";

export const useZones = (ambienteId: string | null) => {
  return useQuery({
    queryKey: ["zones", ambienteId],
    queryFn: () => fetchZonesByAmbiente(ambienteId!),
    enabled: !!ambienteId,
  });
};
