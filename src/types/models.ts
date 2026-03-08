export type Role = "ADMIN" | "RESPONSABLE" | "READONLY";

export type CompartmentStatus = "AVAILABLE" | "MAINTENANCE";

export type OpenOrderStatus = "PENDING" | "RETIRED" | "CANCELLED";

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
export function mapUserFromApiResponse(data: Partial<UserApiResponse>): User {
  return {
    id: String(data.id ?? ""),
    clinic_id: String(data.clinic_id ?? ""),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: (data.role as Role) ?? "READONLY",
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

export interface CompartmentInventory {
  id: string;
  clinic_id: string;
  compartment_id: string;
  product_id: string;
  qty_available: number;
  qty_reserved: number;
  /** Datos expandidos (si el API los incluye) */
  locker_id?: string;
  locker_name?: string;
  compartment_name?: string;
  compartment_code?: string;
  product_name?: string;
  product_sku?: string;
}

export interface OpenOrder {
  id: string;
  clinic_id: string;
  requested_by_user_id: string;
  locker_id: string;
  compartment_id: string;
  product_id: string;
  quantity: number;
  status: OpenOrderStatus;
  requested_at: string;
  read_at?: string;
  external_ref: string;
  meta?: Record<string, unknown>;
}

/** Respuesta del endpoint GET /dashboard. */
export interface DashboardData {
  active_products_count: number;
  available_lockers_count: number;
  pending_orders_count: number;
  has_low_stock: boolean;
  latest_orders: OpenOrder[];
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

/** Filtros GET /api/v1/inventory */
export interface InventoryFilters {
  locker_id?: string;
  compartment_id?: string;
  product_id?: string;
}

/** Filtros GET /api/v1/open-orders */
export interface OpenOrderFilters {
  status?: OpenOrderStatus;
  from?: string;
  to?: string;
}

/** Filtros GET /api/v1/audit-logs */
export interface AuditLogFilters {
  entity_type?: string;
  entity_id?: string;
  from?: string;
  to?: string;
}
