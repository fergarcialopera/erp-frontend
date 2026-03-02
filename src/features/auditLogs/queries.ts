import { useQuery } from "@tanstack/react-query";
import type { AuditLogFilters } from "@/types/models";
import { fetchAuditLogs } from "./api";

export const useAuditLogs = (clinicId: string | null, filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ["auditLogs", clinicId, filters],
    queryFn: () => fetchAuditLogs(filters),
    enabled: !!clinicId,
  });
};
