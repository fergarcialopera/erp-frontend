import { API_BASE_URL } from "./env";

/** BasePath fijo de la API. Única fuente de verdad; no hardcodear en componentes. */
export const API_BASEPATH = "/api/v1";

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

/** Paths relativos al baseURL del apiClient. */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },
  CLINICS: { ME: "/clinics/me" },
  USERS: resource("/users"),
  LOCKERS: resource("/lockers"),
  COMPARTMENTS: {
    LIST_BY_LOCKER: (lockerId: string) => `/lockers/${lockerId}/compartments`,
    DETAIL: (id: string) => `/compartments/${id}`,
  },
  PRODUCTS: resource("/products"),
  INVENTORY: { LIST: "/inventory" },
  OPEN_ORDERS: {
    LIST: "/open-orders",
    CREATE: "/open-orders",
    CANCEL: (id: string) => `/open-orders/${id}/cancel`,
    RETIRE: (id: string) => `/open-orders/${id}/retire`,
  },
  AUDIT_LOGS: { LIST: "/audit-logs" },
} as const;
