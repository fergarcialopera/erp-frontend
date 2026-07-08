export interface AuditUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditClinicSummary {
  id: string;
  name: string;
}

export interface AccessAuditLog {
  id: string;
  registered_at: string;
  event: string;
  success: boolean;
  error: string | null;
  clinic: AuditClinicSummary;
  user: AuditUserSummary | null;
  ip_address: string;
  user_agent: string;
  request_id: string;
}

export type ActivityAuditType = "add" | "edit" | "delete";

export interface ActivityAuditLog {
  id: string;
  registered_at: string;
  type: string;
  entity: string;
  entity_id: string;
  user_id: string;
  clinic_id: string;
  user: AuditUserSummary | null;
  clinic: AuditClinicSummary | null;
  data?: Record<string, unknown>;
}

export interface AuditListParams {
  page?: number;
  per_page?: number;
  clinic_id?: string;
}

export interface AccessAuditListParams extends AuditListParams {
  event?: string;
  success?: boolean;
  user_id?: string;
}

export interface ActivityAuditListParams extends AuditListParams {
  type?: string;
  entity?: string;
  entity_id?: string;
  user_id?: string;
}

export interface AuditPaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface AuditPaginatedResult<T> {
  data: T[];
  meta: AuditPaginationMeta;
}
