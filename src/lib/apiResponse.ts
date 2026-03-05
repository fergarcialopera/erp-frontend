/**
 * Helpers para adaptar las respuestas del API al formato documentado en /api-docs.json.
 * El spec (OpenAPI/YAML) suele definir respuestas con envelope { data: T } o { data: T[], meta?, links? }.
 */

/** Respuesta típica de un endpoint que devuelve un recurso (GET one, POST, PATCH). */
export interface ApiEnvelope<T> {
  data: T;
}

/** Respuesta típica de un endpoint que devuelve una lista. */
export interface ApiListEnvelope<T> {
  data: T[];
  meta?: { total?: number; per_page?: number; current_page?: number; [key: string]: unknown };
  links?: Record<string, string>;
}

/**
 * Extrae el recurso de la respuesta del API.
 * Si la respuesta tiene forma { data: T }, devuelve data; si no, devuelve la respuesta tal cual.
 */
export function unwrapData<T>(response: unknown): T {
  if (response != null && typeof response === "object" && "data" in response) {
    const envelope = response as ApiEnvelope<T>;
    return envelope.data as T;
  }
  return response as T;
}

/**
 * Extrae la lista de la respuesta del API.
 * Si la respuesta tiene forma { data: T[] }, devuelve data; si no, asume que la respuesta es el array.
 */
export function unwrapList<T>(response: unknown): T[] {
  if (response != null && typeof response === "object" && "data" in response) {
    const envelope = response as ApiListEnvelope<T>;
    const data = envelope.data;
    return Array.isArray(data) ? data : [];
  }
  return Array.isArray(response) ? (response as T[]) : [];
}
