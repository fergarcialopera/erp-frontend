import { isAxiosError } from "axios";

export interface ApiErrorMeta {
  fallback?: string;
  locked?: boolean;
  [key: string]: unknown;
}

export interface ParsedApiError {
  status?: number;
  detail?: string;
  title?: string;
  meta: ApiErrorMeta;
}

function extractDetail(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  if (typeof data.title === "string") return data.title;
  if (Array.isArray(data.detail)) {
    return (data.detail as { msg?: string }[])
      .map((d) => d.msg ?? String(d))
      .filter(Boolean)
      .join(", ");
  }
  return undefined;
}

export function parseApiError(err: unknown): ParsedApiError {
  if (!isAxiosError(err)) {
    return {
      detail: err instanceof Error ? err.message : undefined,
      meta: {},
    };
  }
  const data = err.response?.data as Record<string, unknown> | undefined;
  const meta = (data?.meta ?? {}) as ApiErrorMeta;
  return {
    status: err.response?.status,
    detail: extractDetail(data),
    title: typeof data?.title === "string" ? data.title : undefined,
    meta,
  };
}

export function isPinLockedError(err: unknown): boolean {
  const { status, meta } = parseApiError(err);
  return status === 423 && meta.locked === true;
}

export function isPinFallbackToClassicError(err: unknown): boolean {
  const { status, meta } = parseApiError(err);
  return status === 423 && meta.fallback === "classic_login";
}
