import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "./api";

export const useAuditLogs = (clinicId: string | null, options?: { platformScope?: boolean }) => {
  const platformScope = options?.platformScope === true;
  return useQuery({
    queryKey: platformScope ? ["auditLogs", "platform"] : ["auditLogs", clinicId],
    queryFn: () => fetchAuditLogs(),
    enabled: platformScope || !!clinicId,
  });
};
