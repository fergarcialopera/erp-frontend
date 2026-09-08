import { apiClient } from "@/lib/apiClient";
import { unwrapData, unwrapPaginatedList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { asOptionalString } from "@/lib/catalogMap";
import type {
  ProductImport,
  ProductImportBulkDecisionBody,
  ProductImportDecision,
  ProductImportDetail,
  ProductImportDiffValue,
  ProductImportIssue,
  ProductImportListParams,
  ProductImportRow,
  ProductImportRowsParams,
  ProductImportRowStatus,
  ProductImportSessionStatus,
} from "./types";

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function mapIssue(raw: unknown): ProductImportIssue | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const code = asOptionalString(o.code);
  const message = asOptionalString(o.message);
  if (!code && !message) return null;
  return {
    code: code ?? "unknown",
    message: message ?? "",
    column: asOptionalString(o.column) ?? null,
  };
}

function mapIssues(raw: unknown): ProductImportIssue[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapIssue).filter((x): x is ProductImportIssue => x != null);
}

function mapDiff(raw: unknown): Record<string, ProductImportDiffValue> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, ProductImportDiffValue> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      const entry = value as Record<string, unknown>;
      out[key] = { current: entry.current, incoming: entry.incoming };
    } else {
      out[key] = { current: null, incoming: value };
    }
  }
  return out;
}

function mapRecord(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function mapCatalogPreview(raw: unknown): Record<string, string[]> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      out[key] = value.map((v) => String(v)).filter(Boolean);
    }
  }
  return out;
}

export function mapProductImport(raw: Record<string, unknown>): ProductImport {
  return {
    id: String(raw.id ?? ""),
    filename: String(raw.filename ?? ""),
    status: String(raw.status ?? "analyzing") as ProductImportSessionStatus,
    created_by: String(raw.created_by ?? ""),
    created_by_email: asOptionalString(raw.created_by_email) ?? null,
    created_by_name: asOptionalString(raw.created_by_name) ?? null,
    total_rows: asNumber(raw.total_rows),
    ready_count: asNumber(raw.ready_count),
    conflict_count: asNumber(raw.conflict_count),
    invalid_count: asNumber(raw.invalid_count),
    created_count: asNumber(raw.created_count),
    updated_count: asNumber(raw.updated_count),
    failed_count: asNumber(raw.failed_count),
    skipped_count: asNumber(raw.skipped_count),
    created_at: raw.created_at != null ? String(raw.created_at) : "",
    updated_at: raw.updated_at != null ? String(raw.updated_at) : "",
  };
}

export function mapProductImportDetail(raw: Record<string, unknown>): ProductImportDetail {
  return {
    ...mapProductImport(raw),
    structural_errors: mapIssues(raw.structural_errors),
    catalog_preview: mapCatalogPreview(raw.catalog_preview),
  };
}

export function mapProductImportRow(raw: Record<string, unknown>): ProductImportRow {
  const decisionRaw = asOptionalString(raw.decision);
  return {
    id: String(raw.id ?? ""),
    import_id: String(raw.import_id ?? ""),
    row_number: asNumber(raw.row_number),
    status: String(raw.status ?? "ready") as ProductImportRowStatus,
    decision: (decisionRaw as ProductImportDecision | null) ?? null,
    existing_product_id: asOptionalString(raw.existing_product_id) ?? null,
    result_product_id: asOptionalString(raw.result_product_id) ?? null,
    normalized: mapRecord(raw.normalized),
    resolved: mapRecord(raw.resolved),
    warnings: mapIssues(raw.warnings),
    errors: mapIssues(raw.errors),
    diff: mapDiff(raw.diff),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

export function rowDisplayName(row: ProductImportRow): string {
  const sources = [row.normalized, row.resolved];
  for (const src of sources) {
    const name = src?.name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return "—";
}

export function rowInternalReference(row: ProductImportRow): string {
  const sources = [row.normalized, row.resolved];
  for (const src of sources) {
    const ref = src?.internal_reference;
    if (typeof ref === "string" && ref.trim()) return ref.trim();
  }
  return "—";
}

export async function fetchProductImports(params: ProductImportListParams = {}) {
  const res = await apiClient.get(ENDPOINTS.PRODUCT_IMPORTS.LIST, { params });
  const { data, meta } = unwrapPaginatedList<Record<string, unknown>>(res.data);
  return { data: data.map(mapProductImport), meta };
}

export async function fetchProductImport(id: string): Promise<ProductImportDetail> {
  const res = await apiClient.get(ENDPOINTS.PRODUCT_IMPORTS.DETAIL(id));
  return mapProductImportDetail(unwrapData<Record<string, unknown>>(res.data));
}

export async function uploadProductImport(file: File): Promise<ProductImportDetail> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(ENDPOINTS.PRODUCT_IMPORTS.CREATE, formData, {
    transformRequest: [
      (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    ],
  });
  return mapProductImportDetail(unwrapData<Record<string, unknown>>(res.data));
}

export async function fetchProductImportRows(id: string, params: ProductImportRowsParams = {}) {
  const res = await apiClient.get(ENDPOINTS.PRODUCT_IMPORTS.ROWS(id), { params });
  const { data, meta } = unwrapPaginatedList<Record<string, unknown>>(res.data);
  return { data: data.map(mapProductImportRow), meta };
}

export async function setProductImportRowDecision(
  id: string,
  rowId: string,
  decision: ProductImportDecision,
): Promise<ProductImportRow> {
  const res = await apiClient.patch(ENDPOINTS.PRODUCT_IMPORTS.ROW(id, rowId), { decision });
  return mapProductImportRow(unwrapData<Record<string, unknown>>(res.data));
}

export async function bulkSetProductImportRowDecision(
  id: string,
  body: ProductImportBulkDecisionBody,
): Promise<void> {
  await apiClient.patch(ENDPOINTS.PRODUCT_IMPORTS.ROWS(id), {
    decision: body.decision,
    status: body.status ?? "conflict",
  });
}

export async function confirmProductImport(id: string): Promise<ProductImportDetail> {
  const res = await apiClient.post(ENDPOINTS.PRODUCT_IMPORTS.CONFIRM(id));
  return mapProductImportDetail(unwrapData<Record<string, unknown>>(res.data));
}

export async function cancelProductImport(id: string): Promise<void> {
  await apiClient.post(ENDPOINTS.PRODUCT_IMPORTS.CANCEL(id));
}
