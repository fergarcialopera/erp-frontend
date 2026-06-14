import { useQuery } from "@tanstack/react-query";
import { fetchIncidents } from "./api";

export const useIncidents = (clinicId: string | null, options?: { platformScope?: boolean }) => {
  const platformScope = options?.platformScope === true;
  return useQuery({
    queryKey: platformScope ? ["incidents", "platform"] : ["incidents", clinicId],
    queryFn: fetchIncidents,
    enabled: platformScope || !!clinicId,
  });
};
