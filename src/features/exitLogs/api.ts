import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { ExitLog } from "@/types/models";
import type { ExitLogProductDisplayRow } from "@/types/models";
import { groupExitLogDetailByProduct } from "./groupExitLogDetailByProduct";
import { normalizeExitLogDetail } from "./exitLogDetailNormalize";

/** Asignación explícita por compartimento (OpenAPI ExitLogCreateLocationAllocation). */
export interface CreateExitLogLocationAllocation {
  compartment_id: string;
  quantity: number;
  ambiente_id?: string;
}

/** Un producto con varias ubicaciones (recomendado para multi-compartimento). */
export interface CreateExitLogItemWithLocations {
  product_id: string;
  locations: CreateExitLogLocationAllocation[];
}

/** Un producto con cantidad total y opcionalmente un compartimento (legacy). */
export interface CreateExitLogItemLegacy {
  product_id: string;
  quantity: number;
  compartment_id?: string;
  ambiente_id?: string;
}

export type CreateExitLogItem = CreateExitLogItemWithLocations | CreateExitLogItemLegacy;

export function isCreateItemWithLocations(
  item: CreateExitLogItem,
): item is CreateExitLogItemWithLocations {
  return "locations" in item && Array.isArray(item.locations);
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

export interface ExitLogLocationLine {
  item_id: string;
  requested_quantity: number;
  confirmed_quantity?: number | null;
  stock_available?: number | null;
  ambiente?: { id: string; name?: string; device_id?: string | null } | null;
  compartment?: { id: string; code?: string } | null;
}

/** Producto dentro del detalle de salida (un ítem por product_id). */
export interface ExitLogProductItem {
  product?: {
    id: string;
    name?: string;
    sku?: string | null;
    barcode?: string | null;
  };
  requested_quantity_total?: number;
  confirmed_quantity_total?: number | null;
  locations: ExitLogLocationLine[];
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
  location?: {
    ambiente?: { id: string; name?: string; device_id?: string | null } | null;
    compartment?: { id: string; code?: string } | null;
  } | null;
}

/** Respuesta enriquecida de create/get/patch/confirm/cancel (OpenAPI v2). */
export interface ExitLogDetail {
  exit_log: ExitLogHeader;
  items: ExitLogProductItem[];
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

function serializeCreateItem(item: CreateExitLogItem): Record<string, unknown> {
  if (isCreateItemWithLocations(item)) {
    return {
      product_id: item.product_id,
      locations: item.locations.map((loc) => ({
        compartment_id: loc.compartment_id,
        quantity: loc.quantity,
        ...(loc.ambiente_id ? { ambiente_id: loc.ambiente_id } : {}),
      })),
    };
  }
  return {
    product_id: item.product_id,
    quantity: item.quantity,
    ...(item.compartment_id ? { compartment_id: item.compartment_id } : {}),
    ...(item.ambiente_id ? { ambiente_id: item.ambiente_id } : {}),
  };
}

function dedupeExitLogHeaders(headers: ExitLog[]): ExitLog[] {
  const seen = new Set<string>();
  return headers.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

export const fetchExitLogs = async (): Promise<ExitLog[]> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.LIST);
  const rows = unwrapList<Record<string, unknown>>(res.data);
  return dedupeExitLogHeaders(rows.map(mapRawExitLogListRow));
};

/** Últimas N salidas: filas visuales agrupadas por producto. */
export async function fetchRecentExitProductRows(
  limitExits: number,
): Promise<ExitLogProductDisplayRow[]> {
  const headers = [...(await fetchExitLogs())].sort(
    (a, b) => new Date(String(b.created_at ?? "")).getTime() - new Date(String(a.created_at ?? "")).getTime(),
  );
  const top = headers.slice(0, limitExits);
  const details = await Promise.all(top.map((row) => getExitLog(row.id).catch(() => null)));
  const rows = details
    .filter((row): row is ExitLogDetail => row !== null)
    .flatMap((detail) => groupExitLogDetailByProduct(detail));
  return dedupeExitLogDisplayRows(rows).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function dedupeExitLogDisplayRows(rows: ExitLogProductDisplayRow[]): ExitLogProductDisplayRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

/** Lista de salidas: una fila visual por producto y salida. */
export async function fetchExitLogsEnriched(): Promise<ExitLogProductDisplayRow[]> {
  const headers = await fetchExitLogs();
  const details = await Promise.all(headers.map((row) => getExitLog(row.id).catch(() => null)));
  const rows = details
    .filter((row): row is ExitLogDetail => row !== null)
    .flatMap((detail) => groupExitLogDetailByProduct(detail));
  return dedupeExitLogDisplayRows(rows).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/**
 * Crea un borrador de salida (POST /exit-logs).
 * Body: { items: [{ product_id, locations[] }] | legacy, note? }
 */
export const createExitLog = async (data: CreateExitLogBody): Promise<ExitLogDetail> => {
  const requestBody: Record<string, unknown> = {
    items: data.items.map(serializeCreateItem),
  };
  if (data.note?.trim()) {
    requestBody.note = data.note.trim();
  }
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CREATE, requestBody);
  return normalizeExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const getExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.get(ENDPOINTS.EXIT_LOGS.DETAIL(id));
  return normalizeExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const updateExitLog = async (id: string, data: UpdateExitLogBody): Promise<ExitLogDetail> => {
  const res = await apiClient.patch(ENDPOINTS.EXIT_LOGS.DETAIL(id), {
    items: data.items.map((item) => ({
      item_id: String(item.item_id),
      quantity: item.quantity,
    })),
  });
  return normalizeExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const confirmExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CONFIRM(id));
  return normalizeExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};

export const cancelExitLog = async (id: string): Promise<ExitLogDetail> => {
  const res = await apiClient.post(ENDPOINTS.EXIT_LOGS.CANCEL(id));
  return normalizeExitLogDetail(unwrapData<ExitLogDetail>(res.data));
};
