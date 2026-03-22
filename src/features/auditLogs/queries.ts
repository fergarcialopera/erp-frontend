import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "./api";

export const useAuditLogs = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["auditLogs", clinicId],
    queryFn: () => fetchAuditLogs(),
    enabled: !!clinicId,
  });
};
