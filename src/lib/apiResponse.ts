/**
 * Helpers para adaptar las respuestas del API al formato documentado en /docs.
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

export interface PaginatedListMeta {
  page: number;
  per_page: number;
  total: number;
}

/** Extrae lista paginada `{ data: T[], meta }` del API. */
export function unwrapPaginatedList<T>(response: unknown): {
  data: T[];
  meta: PaginatedListMeta;
} {
  if (response != null && typeof response === "object" && "data" in response) {
    const envelope = response as ApiListEnvelope<T>;
    const data = Array.isArray(envelope.data) ? envelope.data : [];
    const rawMeta = envelope.meta ?? {};
    const page =
      typeof rawMeta.page === "number"
        ? rawMeta.page
        : typeof rawMeta.current_page === "number"
          ? rawMeta.current_page
          : 1;
    const per_page = typeof rawMeta.per_page === "number" ? rawMeta.per_page : data.length;
    const total = typeof rawMeta.total === "number" ? rawMeta.total : data.length;
    return { data, meta: { page, per_page, total } };
  }
  const data = Array.isArray(response) ? (response as T[]) : [];
  return { data, meta: { page: 1, per_page: data.length, total: data.length } };
}
