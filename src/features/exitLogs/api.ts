import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { ExitLog } from "@/types/models";

/** Cuerpo para registrar salida de stock en ExitLogs. */
export interface CreateExitLogBody {
  sku: string;
  quantity: number;
  note?: string;
}

export interface UpdateExitLogBody {
  quantity: number;
}

function mapRawExitLog(d: Record<string, unknown>): ExitLog {
  return {
    id: String(d.id ?? ""),
    clinic_id: String(d.clinic_id ?? ""),
    requested_by_user_id: String(d.requested_by_user_id ?? d.user_id ?? ""),
    locker_id: String(d.locker_id ?? ""),
    compartment_id: String(d.compartment_id ?? ""),
    product_id: String(d.product_id ?? d.sku ?? ""),
    quantity: Number(d.quantity ?? 0),
    note: d.note != null ? String(d.note) : undefined,
    created_at: String(d.created_at ?? d.requested_at ?? d.occurred_at ?? new Date().toISOString()),
    product_sku: d.sku != null ? String(d.sku) : undefined,
    product_name: d.name != null ? String(d.name) : undefined,
    requested_by_user_name: d.requested_by_user_name != null ? String(d.requested_by_user_name) : undefined,
    locker_name: d.locker_name != null ? String(d.locker_name) : undefined,
    locker_code: d.locker_code != null ? String(d.locker_code) : undefined,
    compartment_name: d.compartment_name != null ? String(d.compartment_name) : undefined,
    compartment_code: d.compartment_code != null ? String(d.compartment_code) : undefined,
  };
}

export const fetchExitLogs = async (): Promise<ExitLog[]> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.LIST);
  const rows = unwrapList<Record<string, unknown>>(res.data);
  return rows.map(mapRawExitLog);
};

/**
 * Registra una salida de stock (ExitLogs), según OpenAPI POST /exit-logs.
 */
export const createExitLog = async (data: CreateExitLogBody): Promise<ExitLog> => {
  const requestBody = {
    sku: data.sku,
    quantity: data.quantity,
    note: data.note,
  };
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CREATE, requestBody);
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawExitLog(responseData);
};

export const getExitLog = async (id: string): Promise<ExitLog> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.DETAIL(id));
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawExitLog(responseData);
};

export const updateExitLog = async (id: string, data: UpdateExitLogBody): Promise<ExitLog> => {
  const res = await apiClient.patch(ENDPOINTS.EXIT_LOGS.DETAIL(id), {
    quantity: data.quantity,
  });
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawExitLog(responseData);
};

export const confirmExitLog = async (id: string): Promise<ExitLog> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CONFIRM(id));
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawExitLog(responseData);
};

export const cancelExitLog = async (id: string): Promise<ExitLog> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CANCEL(id));
  const responseData = unwrapData<Record<string, unknown>>(res.data);
  return mapRawExitLog(responseData);
};
