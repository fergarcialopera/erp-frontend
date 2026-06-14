import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";

/** POST /entry-logs — OpenAPI ERP Clinic Stock API. */
export interface CreateEntryLogBody {
  sku: string;
  name?: string;
  quantity: number;
  note?: string;
  zone_id?: string;
  /** Solo con zone_id; debe ser el ambiente de la zona. */
  ambiente_id?: string;
}

export interface AmbienteRef {
  id: string;
  name?: string;
  device_id?: string | null;
}

export interface ZoneRef {
  id: string;
  code?: string;
}

export interface EntryLogListItem {
  id: string;
  sku: string;
  name?: string;
  quantity: number;
  note?: string | null;
  created_by?: string;
  created_at?: string;
  ambiente?: AmbienteRef | null;
  zone?: ZoneRef | null;
}

export interface CreateEntryLogResponse {
  entry_log: EntryLogListItem;
  inventory?: {
    sku?: string;
    quantity?: number;
    zone_id?: string | null;
    ambiente?: AmbienteRef | null;
    zone?: ZoneRef | null;
  };
}

/** Construye el body según contrato OpenAPI (ambiente_id nunca sin zone_id). */
export function buildCreateEntryLogRequestBody(data: CreateEntryLogBody): Record<string, unknown> {
  const body: Record<string, unknown> = {
    sku: data.sku,
    quantity: data.quantity,
  };
  const name = data.name?.trim();
  if (name) body.name = name;
  const note = data.note?.trim();
  if (note) body.note = note;
  if (data.zone_id) {
    body.zone_id = data.zone_id;
    if (data.ambiente_id) body.ambiente_id = data.ambiente_id;
  }
  return body;
}

export const createEntryLog = async (data: CreateEntryLogBody): Promise<CreateEntryLogResponse> => {
  const res = await apiClient.post(ENDPOINTS.ENTRY_LOGS.CREATE, buildCreateEntryLogRequestBody(data));
  return unwrapData<CreateEntryLogResponse>(res.data);
};
