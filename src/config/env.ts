/** Base URL de la API (sin /api/v1). Fuente: VITE_API_BASE_URL */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8000";

/** Alias para compatibilidad */
export const ENV = { API_BASE_URL };
