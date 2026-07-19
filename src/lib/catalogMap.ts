import type { CatalogRef } from "@/types/models";

export function mapCatalogRef(raw: unknown): CatalogRef | null {
  if (raw == null || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = obj.id != null ? String(obj.id) : "";
  const name = obj.name != null ? String(obj.name) : "";
  if (!id) return null;
  return { id, name: name || id };
}

export function asOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export function asOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function asBoolean(value: unknown, defaultValue = true): boolean {
  if (value === undefined || value === null) return defaultValue;
  return value === true || value === 1 || value === "1";
}
