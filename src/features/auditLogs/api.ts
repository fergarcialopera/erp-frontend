import { apiClient } from "@/lib/apiClient";
import { unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { AuditLog, AuditLogFilters } from "@/types/models";

export const fetchAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  const res = await apiClient.get(ENDPOINTS.AUDIT_LOGS.LIST, { params: filters });
  return unwrapList<AuditLog>(res.data);
};
