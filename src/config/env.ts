/**
 * Base URL de la API (sin /api/v1). Fuente: VITE_API_BASE_URL.
 * - Vacío ("") en dev sin .env: las peticiones van al mismo origen y el proxy de Vite las reenvía al backend.
 * - En prod o con .env: URL completa del backend (ej. http://localhost:8000).
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.DEV ? "" : "http://localhost:8000");

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

/** Alias para compatibilidad */
export const ENV = { API_BASE_URL };
