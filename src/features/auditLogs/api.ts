import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import type { AuditLog, AuditLogFilters } from "@/types/models";

export const fetchAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  const res = await apiClient.get<AuditLog[]>(ENDPOINTS.AUDIT_LOGS.LIST, {
    params: filters,
  });
  return res.data;
};
