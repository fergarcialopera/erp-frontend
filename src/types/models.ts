export type Role = "ADMIN" | "RESPONSABLE" | "READONLY";

export type CompartmentStatus = "AVAILABLE" | "MAINTENANCE";

export type OpenOrderStatus = "PENDING" | "RETIRED" | "CANCELLED";

export type ActorType = "USER" | "SYSTEM";

export interface Clinic {
  id: string;
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
  role: Role;
  is_active: boolean;
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
