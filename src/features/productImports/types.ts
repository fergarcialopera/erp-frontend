/** Alineado con OpenAPI `ProductImport` / `ProductImportRow`. */

export type ProductImportSessionStatus =
  | "analyzing"
  | "ready_for_review"
  | "invalid"
  | "processing"
  | "completed"
  | "completed_with_errors"
  | "cancelled";

export type ProductImportRowStatus =
  "ready" | "conflict" | "invalid" | "created" | "updated" | "failed" | "skipped";

export type ProductImportDecision = "create_new" | "update_existing" | "skip";

export type ProductImportIssueCode =
  | "empty_file"
  | "wrong_delimiter"
  | "missing_headers"
  | "unknown_headers"
  | "orphan_continuation_row"
  | "no_product_rows"
  | "missing_name"
  | "unexpected_product_type"
  | "duplicate_internal_reference_in_file"
  | "missing_supplier_vendor"
  | "barcode_already_exists"
  | "national_code_already_exists"
  | "subcategory_without_category"
  | "sub_brand_without_brand"
  | "missing_resolved_payload"
  | "import_failed";

export interface ProductImportIssue {
  code: string;
  message: string;
  column?: string | null;
}

export interface ProductImportDiffValue {
  current: unknown;
  incoming: unknown;
}

export interface ProductImport {
  id: string;
  filename: string;
  status: ProductImportSessionStatus;
  created_by: string;
  created_by_email: string | null;
  created_by_name: string | null;
  total_rows: number;
  ready_count: number;
  conflict_count: number;
  invalid_count: number;
  created_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImportDetail extends ProductImport {
  structural_errors: ProductImportIssue[];
  catalog_preview: Record<string, string[]>;
}

export interface ProductImportRow {
  id: string;
  import_id: string;
  row_number: number;
  status: ProductImportRowStatus;
  decision: ProductImportDecision | null;
  existing_product_id: string | null;
  result_product_id: string | null;
  normalized: Record<string, unknown> | null;
  resolved: Record<string, unknown> | null;
  warnings: ProductImportIssue[];
  errors: ProductImportIssue[];
  diff: Record<string, ProductImportDiffValue> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImportListParams {
  page?: number;
  per_page?: number;
}

export interface ProductImportRowsParams {
  status?: ProductImportRowStatus;
  page?: number;
  per_page?: number;
}

export interface ProductImportBulkDecisionBody {
  decision: ProductImportDecision;
  status?: "conflict";
}
