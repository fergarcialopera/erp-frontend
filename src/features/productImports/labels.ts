import type {
  ProductImportDecision,
  ProductImportRowStatus,
  ProductImportSessionStatus,
} from "./types";

/** Mapa `productImportIssueCode → string` (traducir por `code`, no parsear `message`). */
const PRODUCT_IMPORT_ISSUE_CODE_LABELS: Record<string, string> = {
  empty_file: "El archivo CSV está vacío.",
  wrong_delimiter:
    "El CSV no usa separador de punto y coma (;). Reexporta desde Odoo con separador «punto y coma».",
  missing_headers: "Faltan columnas obligatorias en la cabecera del CSV.",
  unknown_headers: "Hay columnas desconocidas o no esperadas en la cabecera.",
  orphan_continuation_row:
    "Hay filas de continuación de proveedor sin producto principal asociado.",
  no_product_rows: "El archivo no contiene ninguna fila de producto válida.",
  missing_name: "Falta el nombre del producto.",
  unexpected_product_type: "Tipo de producto inesperado; se importará igualmente.",
  duplicate_internal_reference_in_file: "Referencia interna duplicada dentro del mismo archivo.",
  missing_supplier_vendor: "Falta el proveedor (vendor) en la fila.",
  barcode_already_exists: "El código de barras ya existe en otro producto.",
  national_code_already_exists: "El código nacional ya existe en otro producto.",
  subcategory_without_category: "Hay subcategoría sin categoría asociada.",
  sub_brand_without_brand: "Hay submarca sin marca asociada.",
  missing_resolved_payload: "Falta el payload resuelto para aplicar la importación.",
  import_failed: "Error al aplicar la importación de esta fila.",
};

const SESSION_STATUS_LABELS: Record<ProductImportSessionStatus, string> = {
  analyzing: "Analizando",
  ready_for_review: "Lista para revisar",
  invalid: "Inválida",
  processing: "Procesando",
  completed: "Completada",
  completed_with_errors: "Completada con errores",
  cancelled: "Cancelada",
};

const ROW_STATUS_LABELS: Record<ProductImportRowStatus, string> = {
  ready: "Lista",
  conflict: "Conflicto",
  invalid: "Inválida",
  created: "Creada",
  updated: "Actualizada",
  failed: "Fallida",
  skipped: "Omitida",
};

const DECISION_LABELS: Record<ProductImportDecision, string> = {
  create_new: "Crear nuevo",
  update_existing: "Actualizar existente",
  skip: "Omitir",
};

const CATALOG_PREVIEW_LABELS: Record<string, string> = {
  categories: "Categorías",
  subcategories: "Subcategorías",
  brands: "Marcas",
  sub_brands: "Submarcas",
  suppliers: "Proveedores",
  tags: "Etiquetas",
  product_tags: "Etiquetas",
  species: "Especies",
  specialties: "Especialidades",
  dispensing_types: "Tipos de dispensación",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  barcode: "Código de barras",
  internal_reference: "Referencia interna",
  national_code: "Código nacional",
  packaging: "Envase",
  unit_of_measure: "Unidad de medida",
  category: "Categoría",
  subcategory: "Subcategoría",
  brand: "Marca",
  sub_brand: "Submarca",
  supplier: "Proveedor",
  dispensing_type: "Tipo de dispensación",
  species: "Especie",
  specialty: "Especialidad",
};

export function productImportIssueLabel(code: string, column?: string | null): string {
  const base = PRODUCT_IMPORT_ISSUE_CODE_LABELS[code] ?? code;
  if (column) return `${base} (columna: ${column})`;
  return base;
}

export function sessionStatusLabel(status: ProductImportSessionStatus | string): string {
  return SESSION_STATUS_LABELS[status as ProductImportSessionStatus] ?? status;
}

export function rowStatusLabel(status: ProductImportRowStatus | string): string {
  return ROW_STATUS_LABELS[status as ProductImportRowStatus] ?? status;
}

export function decisionLabel(decision: ProductImportDecision | string): string {
  return DECISION_LABELS[decision as ProductImportDecision] ?? decision;
}

export function catalogPreviewKeyLabel(key: string): string {
  return CATALOG_PREVIEW_LABELS[key] ?? key.replace(/_/g, " ");
}

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

export function formatImportDate(value: string | undefined | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDiffValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
