import type { StockLocationLabels } from "@/lib/stockLocation";

export type Role = "SUPER_ADMIN" | "ADMIN" | "TECHNICIAN" | "STAFF";

/** Roles asignables a usuarios de clínica (no incluye SUPER_ADMIN). */
export type ClinicAssignableRole = Exclude<Role, "SUPER_ADMIN">;

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
const VALID_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TECHNICIAN", "STAFF"];

function normalizeRole(role: unknown): Role {
  if (typeof role === "string" && VALID_ROLES.includes(role as Role)) return role as Role;
  return "STAFF";
}

export function mapUserFromApiResponse(data: Partial<UserApiResponse>): User {
  const email = String(data.email ?? "");
  const name = data.name != null && String(data.name).trim() !== "" ? String(data.name).trim() : "";

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
  /** Activo en catálogo global (SUPER_ADMIN). */
  is_active: boolean;
  /** Visible / activo para la clínica actual. */
  is_visible?: boolean;
  /** Incluido en GET /ambientes/:id */
  zones?: Zona[];
}

export interface Zona {
  id: string;
  ambiente_id: string;
  code: string;
  is_active: boolean;
}

/** Referencia embebida de catálogo (categoría, marca, etc.). */
export interface CatalogRef {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug?: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  slug?: string;
  legal_name?: string | null;
  tax_id?: string | null;
  email?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DispensingType {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Rol operativo de locker (tabla roles); distinto de users.role de autenticación. */
export interface OperationalRole {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSupplierLink {
  id: string;
  product_id: string;
  supplier_id: string;
  name: string;
  supplier_reference?: string | null;
  purchase_price?: number | null;
  pvp?: number | null;
  net_cost?: number | null;
  is_preferred: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandSupplierLink {
  id: string;
  brand_id: string;
  supplier_id: string;
  supplier_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DispensingTypeRoleLink {
  id: string;
  dispensing_type_id: string;
  role_id: string;
  role_name: string;
  role_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  /** Presente en contextos clínicos antiguos; el catálogo global no lo incluye. */
  clinic_id?: string;
  sku: string;
  name: string;
  barcode?: string | null;
  internal_reference?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  brand_id?: string | null;
  dispensing_type_id?: string | null;
  unit_of_measure?: string;
  /** Activo en catálogo global (SUPER_ADMIN). */
  is_active: boolean;
  /** Visible en la clínica actual; habilita operaciones con el producto en esa clínica. */
  is_visible?: boolean;
  category?: CatalogRef | null;
  subcategory?: CatalogRef | null;
  brand?: CatalogRef | null;
  dispensing_type?: CatalogRef | null;
  /** Incluidos en GET /products/{id}. */
  suppliers?: ProductSupplierLink[];
  created_at?: string;
  updated_at?: string;
}

/** Body create producto (SKU lo genera el servidor). */
export interface ProductCreatePayload {
  name: string;
  barcode?: string | null;
  internal_reference?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  brand_id?: string | null;
  dispensing_type_id?: string | null;
  is_active?: boolean;
  unit_of_measure?: string;
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface ProductSupplierPayload {
  supplier_id: string;
  supplier_reference?: string | null;
  purchase_price?: number | null;
  pvp?: number | null;
  net_cost?: number | null;
  is_preferred?: boolean;
}

/** Filtros de listado de productos (enviados como query; filtrado cliente de respaldo). */
export interface ProductListFilters {
  active?: boolean;
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
  dispensing_type_id?: string;
  supplier_id?: string;
  search?: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
