import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { ExitLog } from "@/types/models";

/** Línea para crear borrador POST /exit-logs (OpenAPI erp). */
export interface CreateExitLogItem {
  product_id: string;
  quantity: number;
  compartment_id?: string;
}

export interface CreateExitLogBody {
  items: CreateExitLogItem[];
  note?: string;
}

/** Línea para PATCH /exit-logs/{id} en borrador. */
export interface UpdateExitLogItem {
  item_id: string | number;
  quantity: number;
}

export interface UpdateExitLogBody {
  items: UpdateExitLogItem[];
}

export interface ExitLogLine {
  id: string;
  product?: {
    id: string;
    name?: string;
    sku?: string | null;
    barcode?: string | null;
  };
  locker?: { id: string; name?: string; device_id?: string | null } | null;
  compartment?: { id: string; code?: string } | null;
  requested_quantity: number;
  confirmed_quantity?: number | null;
  stock_available?: number | null;
}

export interface ExitLogHeader {
  id: string;
  status?: string;
  note?: string | null;
  created_at?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  created_by?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

/** Respuesta enriquecida de create/get/patch/confirm/cancel. */
export interface ExitLogDetail {
  exit_log: ExitLogHeader;
  items: ExitLogLine[];
}

function mapRawExitLogListRow(d: Record<string, unknown>): ExitLog {
  return {
    id: String(d.id ?? ""),
    clinic_id: String(d.clinic_id ?? ""),
    sku: "",
    quantity: Number(d.items_count ?? 0),
    note: d.note != null ? String(d.note) : undefined,
    created_at: String(d.created_at ?? new Date().toISOString()),
    requested_by_user_id: String(d.created_by_user_id ?? ""),
    status: d.status != null ? String(d.status) : undefined,
  };
}

function mapRawExitLogDetail(data: ExitLogDetail): ExitLogDetail {
  return data;
}

export const fetchExitLogs = async (): Promise<ExitLog[]> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.LIST);
  const rows = unwrapList<Record<string, unknown>>(res.data);
  return rows.map(mapRawExitLogListRow);
};

/**
 * Crea un borrador de salida (POST /exit-logs).
 * Body: { items: [{ product_id, quantity }], note? }
 */
export const createExitLog = async (data: CreateExitLogBody): Promise<ExitLogDetail> => {
  const requestBody: Record<string, unknown> = {
    items: data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      ...(item.compartment_id ? { compartment_id: item.compartment_id } : {}),
    })),
  };
  if (data.note?.trim()) {
    requestBody.note = data.note.trim();
  }
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CREATE, requestBody);
  return mapRawExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const getExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.DETAIL(id));
  return mapRawExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const updateExitLog = async (id: string, data: UpdateExitLogBody): Promise<ExitLogDetail> => {
  const res = await apiClient.patch(ENDPOINTS.EXIT_LOGS.DETAIL(id), {
    items: data.items.map((item) => ({
      item_id: String(item.item_id),
      quantity: item.quantity,
    })),
  });
  return mapRawExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const confirmExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CONFIRM(id));
  return mapRawExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const cancelExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CANCEL(id));
  return mapRawExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

/** Convierte líneas del detalle en filas para tablas legacy (una fila por línea). */
export function flattenExitLogDetail(detail: ExitLogDetail): ExitLog[] {
  const header = detail.exit_log;
  return detail.items.map((line) => ({
    id: header.id,
    clinic_id: "",
    sku: line.product?.sku ?? "",
    quantity: line.requested_quantity,
    note: header.note ?? undefined,
    created_at: header.created_at,
    product_id: line.product?.id,
    product_name: line.product?.name,
    product_sku: line.product?.sku ?? undefined,
    requested_by_user_name: header.created_by?.name ?? undefined,
    locker_name: line.locker?.name,
    compartment_code: line.compartment?.code,
    status: header.status,
  }));
}
