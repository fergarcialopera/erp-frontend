import { API_BASE_URL, API_BASEPATH } from "./env";

/** Re-exportar para uso externo si se necesita. */
export { API_BASEPATH };

/** URL base para axios. Precomputada para evitar concatenaciones repetidas. */
const BASE_URL = `${API_BASE_URL}${API_BASEPATH}`;

export const getApiBaseUrl = () => BASE_URL;

/** Construir URL absoluta (por si se necesita fuera de apiClient). */
export const buildUrl = (path: string) => `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Factory para recursos CRUD estándar (list, create, detail). */
const resource = (base: string) =>
  ({
    LIST: base,
    CREATE: base,
    DETAIL: (id: string) => `${base}/${id}`,
  }) as const;

/** Paths relativos al baseURL del apiClient. Alineados con el backend Laravel (prefix v1). */
export const ENDPOINTS = {
  AUTH: {
    CLINICS: "/auth/clinics",
    CLINIC_LOGIN: "/auth/clinic/login",
    CLINIC_LOGOUT: "/auth/clinic/logout",
    STAFF: "/auth/staff",
    LOGIN: "/auth/login",
    LOGIN_PIN: "/auth/login/pin",
    LOGOUT: "/auth/logout",
    ME: "/me",
    RECOVERY_CLINIC: "/auth/recovery/clinic",
    RECOVERY_USER: "/auth/recovery/user",
    RECOVERY_CONFIRM: "/auth/recovery/confirm",
  },
  CLINIC: {
    GET: "/clinic",
    UPDATE: "/clinic",
    UPDATE_SETTINGS: "/clinic/settings",
    IMAGE: "/clinic/image",
    RECOVERY: "/clinic/recovery",
    PRODUCT: (productId: string) => `/clinic/products/${productId}`,
    AMBIENTE: (ambienteId: string) => `/clinic/ambientes/${ambienteId}`,
  },
  CLINICS: {
    LIST: "/clinics",
    CREATE: "/clinics",
    DETAIL: (id: string) => `/clinics/${id}`,
    PRODUCT: (clinicId: string, productId: string) => `/clinics/${clinicId}/products/${productId}`,
    AMBIENTE: (clinicId: string, ambienteId: string) =>
      `/clinics/${clinicId}/ambientes/${ambienteId}`,
    ASSOCIATE_AMBIENTE: (clinicId: string) => `/clinics/${clinicId}/ambientes`,
    DISASSOCIATE_AMBIENTE: (clinicId: string, ambienteId: string) =>
      `/clinics/${clinicId}/ambientes/${ambienteId}`,
  },
  USERS: {
    ...resource("/users"),
    IMAGE: (id: string) => `/users/${id}/image`,
    RECOVERY: (id: string) => `/users/${id}/recovery`,
  },
  AMBIENTES: {
    ...resource("/ambientes"),
    TREE: "/ambientes/tree",
  },
  ZONES: {
    ...resource("/zones"),
    DETAIL: (id: string) => `/zones/${id}`,
  },
  PRODUCTS: {
    ...resource("/products"),
    STOCK_LOCATIONS: (id: string) => `/products/${id}/stock-locations`,
    SUPPLIERS: (id: string) => `/products/${id}/suppliers`,
    SUPPLIER: (id: string, productSupplierId: string) =>
      `/products/${id}/suppliers/${productSupplierId}`,
    SUPPLIER_PREFERRED: (id: string, productSupplierId: string) =>
      `/products/${id}/suppliers/${productSupplierId}/preferred`,
  },
  CATEGORIES: resource("/categories"),
  SUBCATEGORIES: resource("/subcategories"),
  BRANDS: {
    ...resource("/brands"),
    SUPPLIERS: (id: string) => `/brands/${id}/suppliers`,
    SUPPLIER: (id: string, supplierId: string) => `/brands/${id}/suppliers/${supplierId}`,
  },
  SUPPLIERS: resource("/suppliers"),
  DISPENSING_TYPES: {
    ...resource("/dispensing-types"),
    ROLES: (id: string) => `/dispensing-types/${id}/roles`,
    ROLE: (id: string, roleId: string) => `/dispensing-types/${id}/roles/${roleId}`,
  },
  /** Roles operativos de locker (no confundir con users.role de autenticación). */
  ROLES: resource("/roles"),
  INVENTORY: {
    LIST: "/inventory",
    /** Corrección de stock por ubicación (solo ADMIN, incidencias). */
    ADJUST_PRODUCT: (productId: string) => `/inventory/products/${productId}`,
  },
  /** Registro de entradas de stock (backend v2). */
  ENTRY_LOGS: {
    LIST: "/entry-logs",
    CREATE: "/entry-logs",
  },
  /** Registro de salidas de stock (backend v2). */
  EXIT_LOGS: {
    LIST: "/exit-logs",
    CREATE: "/exit-logs",
    DETAIL: (id: string) => `/exit-logs/${id}`,
    CONFIRM: (id: string) => `/exit-logs/${id}/confirm`,
    CANCEL: (id: string) => `/exit-logs/${id}/cancel`,
  },
  INCIDENTS: {
    LIST: "/incidents",
    CREATE: "/incidents",
    DETAIL: (incidentId: string) => `/incidents/${incidentId}`,
  },
  AUDIT: {
    ACCESS_LOGS: "/audit/logs",
    ACCESS_LOG_DETAIL: (id: string) => `/audit/logs/${id}`,
    ACTIVITY_LOGS: "/audit/activity",
    ACTIVITY_LOG_DETAIL: (id: string) => `/audit/activity/${id}`,
  },
} as const;
