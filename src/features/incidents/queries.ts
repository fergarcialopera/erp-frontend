import { useQuery } from "@tanstack/react-query";
import { fetchIncidents } from "./api";

export const useIncidents = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["incidents", clinicId],
    queryFn: fetchIncidents,
    enabled: !!clinicId,
  });
};
