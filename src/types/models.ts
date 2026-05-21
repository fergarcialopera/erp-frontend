export type Role = "ADMIN" | "TECHNICIAN" | "STAFF";

export type CompartmentStatus = "AVAILABLE" | "MAINTENANCE";

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
  return {
    id: String(data.id ?? ""),
    clinic_id: String(data.clinic_id ?? ""),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: normalizeRole(data.role),
    is_active: data.is_active !== false,
  };
}

export interface Locker {
  id: string;
  clinic_id: string;
  code: string;
  name: string;
  location?: string;
  is_active: boolean;
  /** Incluido en GET /lockers/:id */
  compartments?: Compartment[];
}

export interface Compartment {
  id: string;
  locker_id: string;
  code: string;
  status: CompartmentStatus;
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
  locker?: { id: string; name?: string; device_id?: string | null } | null;
  compartment?: { id: string; code?: string } | null;
}

export interface ProductStockLocations {
  product: Pick<Product, "id" | "sku" | "name">;
  quantity_total: number;
  locations: ProductStockLocation[];
}

export interface CompartmentInventory {
  id: string;
  clinic_id: string;
  compartment_id: string;
  product_id: string;
  qty_available: number;
  qty_reserved: number;
  /** Objetos enriquecidos (GET /inventory) */
  product?: Product;
  compartment?: Compartment;
  locker?: Locker;
  /** Fallbacks planos (si el API los incluye) */
  locker_id?: string;
  locker_code?: string;
  locker_name?: string;
  compartment_name?: string;
  compartment_code?: string;
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
  locker?: { id: string; name?: string; device_id?: string | null } | null;
  compartment?: { id: string; code?: string } | null;
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
  locker_id?: string;
  compartment_id?: string;
  product_id?: string;
  product_name?: string;
  product_sku?: string;
  locker_name?: string;
  locker_code?: string;
  compartment_name?: string;
  compartment_code?: string;
  requested_by_user_name?: string;
  requested_by?: User;
  product?: Product;
  locker?: Locker;
  compartment?: Compartment;
}

export type IncidentSource = "ERP" | "LOCKER";

export interface Incident {
  id: string;
  clinic_id: string;
  title?: string;
  description: string;
  source: IncidentSource | string;
  status?: string;
  reported_by_user_id?: string;
  reported_by_user_name?: string;
  locker_id?: string;
  compartment_id?: string;
  created_at?: string;
  updated_at?: string;
}

/** Resumen de una salida para el widget del dashboard (detalle enriquecido). */
export interface DashboardRecentExit {
  id: string;
  status: string;
  created_at: string;
  created_by_name: string;
  product_summary: string;
  product_sku: string;
  total_quantity: number;
  locker_summary: string;
}

/** Datos agregados para la vista de dashboard. */
export interface DashboardData {
  active_products_count: number;
  available_lockers_count: number;
  pending_exits_count: number;
  has_low_stock: boolean;
  latest_exits: DashboardRecentExit[];
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
