import type { StockLocationLabels } from "@/lib/stockLocation";

export type Role = "ADMIN" | "TECHNICIAN" | "STAFF";

export type ActorType = "USER" | "SYSTEM";

export interface Clinic {
  id: string; // ulid
  name: string;
  settings: {
    open_latency_ms?: number;
    [key: string]: unknown;
  };
}

export interface User {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  is_active: boolean;
}

/** Respuesta del endpoint de usuario (login o GET /users/:id). */
export interface UserApiResponse {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Convierte la respuesta del API al modelo User (solo campos usados en la app). */
function normalizeRole(role: unknown): Role {
  if (role === "ADMIN" || role === "TECHNICIAN" || role === "STAFF") return role;
  return "STAFF";
}

export function mapUserFromApiResponse(data: Partial<UserApiResponse>): User {
  const email = String(data.email ?? "");
  const name =
    data.name != null && String(data.name).trim() !== "" ? String(data.name).trim() : "";

  return {
    id: String(data.id ?? ""),
    clinic_id: String(data.clinic_id ?? ""),
    name,
    email,
    role: normalizeRole(data.role),
    is_active: data.is_active !== false,
  };
}

export interface Ambiente {
  id: string;
  clinic_id: string;
  name: string;
  location?: string;
  device_id?: string | null;
  is_active: boolean;
  /** Incluido en GET /ambientes/:id */
  zones?: Zona[];
}

export interface Zona {
  id: string;
  ambiente_id: string;
  code: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  clinic_id: string;
  sku: string;
  name: string;
  barcode?: string;
  is_active: boolean;
}

/** GET /products/{id}/stock-locations — ubicación con stock > 0. */
export interface ProductStockLocation {
  quantity: number;
  ambiente?: { id: string; name?: string; device_id?: string | null } | null;
  zone?: { id: string; code?: string } | null;
}

export interface ProductStockLocations {
  product: Pick<Product, "id" | "sku" | "name">;
  quantity_total: number;
  locations: ProductStockLocation[];
}

export interface ZonaInventory {
  id: string;
  clinic_id: string;
  zone_id: string;
  product_id: string;
  qty_available: number;
  qty_reserved: number;
  /** Objetos enriquecidos (GET /inventory) */
  product?: Product;
  zone?: Zona;
  ambiente?: Ambiente;
  /** Fallbacks planos (si el API los incluye) */
  ambiente_id?: string;
  ambiente_name?: string;
  zone_name?: string;
  zone_code?: string;
  product_name?: string;
  product_sku?: string;
}

export interface EntryLog {
  id: string;
  clinic_id?: string;
  sku: string;
  name?: string;
  quantity: number;
  note?: string | null;
  created_by?: string;
  created_at?: string;
  ambiente?: { id: string; name?: string; device_id?: string | null } | null;
  zone?: { id: string; code?: string } | null;
}

export interface ExitLog {
  id: string;
  clinic_id: string;
  sku: string;
  quantity: number;
  note?: string;
  status?: string;
  created_at?: string;
  requested_by_user_id?: string;
  ambiente_id?: string;
  zone_id?: string;
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  ambiente_name?: string;
  zone_name?: string;
  zone_code?: string;
  requested_by_user_name?: string;
  requested_by?: User;
  product?: Product;
  ambiente?: Ambiente;
  zone?: Zona;
}

export type IncidentSource = "ERP" | "AMBIENTE";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: string;
  clinic_id: string;
  title?: string;
  description: string;
  source: IncidentSource | string;
  severity?: IncidentSeverity | string;
  status?: string;
  reported_by_user_id?: string;
  reported_by_user_name?: string;
  ambiente_id?: string;
  zone_id?: string;
  created_at?: string;
  updated_at?: string;
}

/** Ubicación con cantidad retirada en una salida. */
export interface ExitLogLocationPick {
  labels: StockLocationLabels;
  quantity: number;
}

/**
 * Fila visual de salida: un producto dentro de una salida con todas sus ubicaciones.
 * (Varias líneas internas en exit_log_items → una fila por producto.)
 */
export interface ExitLogProductDisplayRow {
  /** Clave única para listas: salida + producto */
  id: string;
  exitLogId: string;
  productId: string;
  productName: string;
  productSku: string;
  totalQuantity: number;
  locationPicks: ExitLogLocationPick[];
  status: string;
  created_at: string;
  created_by_name: string;
  note?: string;
}

/** Datos agregados para la vista de dashboard. */
export interface DashboardData {
  latest_exits: ExitLogProductDisplayRow[];
}

export interface AuditLog {
  id: string;
  clinic_id: string;
  actor_user_id?: string;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string;
  occurred_at: string;
  payload?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

/** Filtros GET /api/v1/audit-logs */
export interface AuditLogFilters {
  entity_type?: string;
  entity_id?: string;
  from?: string;
  to?: string;
}
