import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapPaginatedList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type {
  AccessAuditListParams,
  AccessAuditLog,
  ActivityAuditListParams,
  ActivityAuditLog,
  AuditClinicSummary,
  AuditPaginatedResult,
  AuditUserSummary,
} from "@/types/audit";

function mapAuditUser(raw: unknown): AuditUserSummary | null {
  if (raw == null || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  if (u.id == null) return null;
  return {
    id: String(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    role: String(u.role ?? ""),
  };
}

function mapAuditClinic(raw: unknown): AuditClinicSummary | null {
  if (raw == null || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (c.id == null) return null;
  return {
    id: String(c.id),
    name: String(c.name ?? ""),
  };
}

function mapAccessAuditLog(raw: Record<string, unknown>): AccessAuditLog {
  const clinic = mapAuditClinic(raw.clinic);
  return {
    id: String(raw.id ?? ""),
    registered_at: String(raw.registered_at ?? ""),
    event: String(raw.event ?? ""),
    success: Boolean(raw.success),
    error: raw.error != null ? String(raw.error) : null,
    clinic: clinic ?? { id: "", name: "—" },
    user: mapAuditUser(raw.user),
    ip_address: String(raw.ip_address ?? ""),
    user_agent: String(raw.user_agent ?? ""),
    request_id: String(raw.request_id ?? ""),
  };
}

function mapActivityAuditLog(raw: Record<string, unknown>): ActivityAuditLog {
  const clinic = mapAuditClinic(raw.clinic);
  return {
    id: String(raw.id ?? ""),
    registered_at: String(raw.registered_at ?? ""),
    type: String(raw.type ?? ""),
    entity: String(raw.entity ?? ""),
    entity_id: String(raw.entity_id ?? ""),
    user_id: String(raw.user_id ?? ""),
    clinic_id: String(raw.clinic_id ?? ""),
    user: mapAuditUser(raw.user),
    clinic,
    data:
      raw.data != null && typeof raw.data === "object"
        ? (raw.data as Record<string, unknown>)
        : undefined,
  };
}

function buildQueryParams(
  params: AccessAuditListParams | ActivityAuditListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params.page != null) query.page = params.page;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.clinic_id) query.clinic_id = params.clinic_id;
  return query;
}

export const fetchAccessAuditLogs = async (
  params: AccessAuditListParams = {},
): Promise<AuditPaginatedResult<AccessAuditLog>> => {
  const query = buildQueryParams(params) as Record<string, string | number | boolean>;
  if (params.event) query.event = params.event;
  if (params.success !== undefined) query.success = params.success;
  if (params.user_id) query.user_id = params.user_id;

  const res = await apiClient.get(ENDPOINTS.AUDIT.ACCESS_LOGS, { params: query });
  const { data, meta } = unwrapPaginatedList<Record<string, unknown>>(res.data);
  return { data: data.map(mapAccessAuditLog), meta };
};

export const fetchAccessAuditLog = async (id: string): Promise<AccessAuditLog> => {
  const res = await apiClient.get(ENDPOINTS.AUDIT.ACCESS_LOG_DETAIL(id));
  const raw = unwrapData<Record<string, unknown>>(res.data);
  return mapAccessAuditLog(raw);
};

export const fetchActivityAuditLogs = async (
  params: ActivityAuditListParams = {},
): Promise<AuditPaginatedResult<ActivityAuditLog>> => {
  const query = buildQueryParams(params) as Record<string, string | number | boolean>;
  if (params.type) query.type = params.type;
  if (params.entity) query.entity = params.entity;
  if (params.entity_id) query.entity_id = params.entity_id;
  if (params.user_id) query.user_id = params.user_id;

  const res = await apiClient.get(ENDPOINTS.AUDIT.ACTIVITY_LOGS, { params: query });
  const { data, meta } = unwrapPaginatedList<Record<string, unknown>>(res.data);
  return { data: data.map(mapActivityAuditLog), meta };
};

export const fetchActivityAuditLog = async (id: string): Promise<ActivityAuditLog> => {
  const res = await apiClient.get(ENDPOINTS.AUDIT.ACTIVITY_LOG_DETAIL(id));
  const raw = unwrapData<Record<string, unknown>>(res.data);
  return mapActivityAuditLog(raw);
};
