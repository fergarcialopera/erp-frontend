import { API_BASE_URL, API_BASEPATH } from "./env";

/** Re-exportar para uso externo si se necesita. */
export { API_BASEPATH };

/** URL base para axios. Precomputada para evitar concatenaciones repetidas. */
const BASE_URL = `${API_BASE_URL}${API_BASEPATH}`;

export const getApiBaseUrl = () => BASE_URL;

/** Construir URL absoluta (por si se necesita fuera de apiClient). */
export const buildUrl = (path: string) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Factory para recursos CRUD estándar (list, create, detail). */
const resource = (base: string) =>
  ({
    LIST: base,
    CREATE: base,
    DETAIL: (id: string) => `${base}/${id}`,
  }) as const;

/** Path del spec OpenAPI (JSON). El backend sirve la documentación en este path. */
export const API_DOCS_PATH = "/api-docs.json";

/** URL absoluta del spec (misma base que apiClient). */
export const getApiDocsUrl = () => buildUrl(API_DOCS_PATH.replace(/^\//, ""));

/** Paths relativos al baseURL del apiClient. Alineados con el backend Laravel (prefix v1). */
export const ENDPOINTS = {
  DASHBOARD: {
    GET: "/dashboard",
  },
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  CLINIC: {
    GET: "/clinic",
    UPDATE_SETTINGS: "/clinic/settings",
  },
  USERS: resource("/users"),
  LOCKERS: resource("/lockers"),
  COMPARTMENTS: {
    DETAIL: (id: string) => `/compartments/${id}`,
  },
  PRODUCTS: resource("/products"),
  INVENTORY: {
    LIST: "/inventory",
    ADD: "/inventory/add",
    REMOVE: "/inventory/remove",
    DELETE: (id: string) => `/inventory/${id}`,
  },
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
    CONFIRM_READ: (id: string) => `/orders/${id}/confirm-read`,
  },
  AUDIT_LOGS: { LIST: "/audit-logs" },
} as const;
