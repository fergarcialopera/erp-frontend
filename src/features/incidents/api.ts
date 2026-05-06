import { ENDPOINTS } from "@/config/endpoints";
import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import type { Incident, IncidentSource } from "@/types/models";

export interface CreateIncidentBody {
  source: IncidentSource | string;
  description: string;
  title?: string;
}

function normalizeSource(value: unknown): IncidentSource | string {
  const source = String(value ?? "").toUpperCase();
  if (source === "ERP" || source === "LOCKER") return source;
  return source || "ERP";
}

function mapRawIncident(d: Record<string, unknown>): Incident {
  return {
    id: String(d.id ?? ""),
    clinic_id: String(d.clinic_id ?? ""),
    title: d.title != null ? String(d.title) : undefined,
    description: String(d.description ?? d.note ?? ""),
    source: normalizeSource(d.source ?? d.origin ?? d.type),
    status: d.status != null ? String(d.status) : undefined,
    reported_by_user_id: d.reported_by_user_id != null ? String(d.reported_by_user_id) : undefined,
    reported_by_user_name: d.reported_by_user_name != null ? String(d.reported_by_user_name) : undefined,
    locker_id: d.locker_id != null ? String(d.locker_id) : undefined,
    compartment_id: d.compartment_id != null ? String(d.compartment_id) : undefined,
    created_at: d.created_at != null ? String(d.created_at) : undefined,
    updated_at: d.updated_at != null ? String(d.updated_at) : undefined,
  };
}

export const fetchIncidents = async (): Promise<Incident[]> => {
  const res = await apiClient.get(ENDPOINTS.INCIDENTS.LIST);
  const rows = unwrapList<Record<string, unknown>>(res.data);
  return rows.map(mapRawIncident);
};

export const createIncident = async (data: CreateIncidentBody): Promise<Incident> => {
  const payload = {
    source: data.source,
    description: data.description,
    title: data.title,
  };
  const res = await apiClient.post(ENDPOINTS.INCIDENTS.CREATE, payload);
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawIncident(responseData);
};
