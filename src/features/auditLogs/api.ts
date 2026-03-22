import { apiClient } from "@/lib/apiClient";
import { unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { AuditLog } from "@/types/models";

/** GET /audit-logs: últimos 100 registros (sin query params en el backend actual). */
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const res = await apiClient.get(ENDPOINTS.AUDIT_LOGS.LIST);
  return unwrapList<AuditLog>(res.data);
};
