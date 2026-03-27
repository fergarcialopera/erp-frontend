/**
 * Base URL de la API (sin basepath). Fuente: VITE_API_BASE_URL.
 * - Vacío ("") en dev sin .env: las peticiones van al mismo origen y el proxy de Vite las reenvía al backend.
 * - En prod o con .env: URL completa del backend (ej. http://localhost:8080).
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

/**
 * Formato del body de login. Algunos backends (FastAPI OAuth2, etc.) esperan form-urlencoded.
 * - "json": { "email", "password" } con Content-Type: application/json (por defecto)
 * - "form": username=...&password=... con Content-Type: application/x-www-form-urlencoded
 */
export const LOGIN_FORMAT =
  (import.meta.env.VITE_LOGIN_FORMAT as string | undefined)?.toLowerCase() || "json";

/**
 * Nombre del campo de usuario en login. Algunos backends usan "username" en lugar de "email".
 */
export const LOGIN_USER_FIELD =
  (import.meta.env.VITE_LOGIN_USER_FIELD as string | undefined)?.toLowerCase() || "email";

/**
 * BasePath de la API (ej. /api/v1). Fuente: VITE_API_BASEPATH.
 * Si tu backend usa otro prefijo (ej. /api), configúralo aquí.
 */
export const API_BASEPATH =
  (import.meta.env.VITE_API_BASEPATH as string | undefined)?.trim() || "/api/v1";
