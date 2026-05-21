import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";

/** POST /entry-logs — OpenAPI ERP Clinic Stock API. */
export interface CreateEntryLogBody {
  sku: string;
  name?: string;
  quantity: number;
  note?: string;
  compartment_id?: string;
  /** Solo con compartment_id; debe ser el locker del compartimento. */
  locker_id?: string;
}

export interface LockerRef {
  id: string;
  name?: string;
  device_id?: string | null;
}

export interface CompartmentRef {
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
  locker?: LockerRef | null;
  compartment?: CompartmentRef | null;
}

export interface CreateEntryLogResponse {
  entry_log: EntryLogListItem;
  inventory?: {
    sku?: string;
    quantity?: number;
    compartment_id?: string | null;
    locker?: LockerRef | null;
    compartment?: CompartmentRef | null;
  };
}

/** Construye el body según contrato OpenAPI (locker_id nunca sin compartment_id). */
export function buildCreateEntryLogRequestBody(data: CreateEntryLogBody): Record<string, unknown> {
  const body: Record<string, unknown> = {
    sku: data.sku,
    quantity: data.quantity,
  };
  const name = data.name?.trim();
  if (name) body.name = name;
  const note = data.note?.trim();
  if (note) body.note = note;
  if (data.compartment_id) {
    body.compartment_id = data.compartment_id;
    if (data.locker_id) body.locker_id = data.locker_id;
  }
  return body;
}

export const createEntryLog = async (data: CreateEntryLogBody): Promise<CreateEntryLogResponse> => {
  const res = await apiClient.post(ENDPOINTS.ENTRY_LOGS.CREATE, buildCreateEntryLogRequestBody(data));
  return unwrapData<CreateEntryLogResponse>(res.data);
};
