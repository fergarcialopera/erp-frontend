import { User, Role, mapUserFromApiResponse } from "@/types/models";
import { resolveUserName } from "@/lib/userDisplay";

const VALID_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TECHNICIAN", "STAFF"];

function normalizeRole(role: unknown): Role {
  if (typeof role === "string" && VALID_ROLES.includes(role as Role)) return role as Role;
  return "STAFF";
}

/** Decodifica el payload de un JWT (parte central, base64url). */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function extractAuthUserRecord(data: Record<string, unknown>): Record<string, unknown> | undefined {
  const nested = data.user;
  if (nested && typeof nested === "object" && nested !== null && "id" in nested) {
    return nested as Record<string, unknown>;
  }
  if (data.id != null || data.user_id != null) {
    return data;
  }
  return undefined;
}

function resolveAuthUserName(
  resUser: Record<string, unknown> | undefined,
  jwtPayload: Record<string, unknown>,
): string {
  const email = String(resUser?.email ?? jwtPayload.email ?? "");
  const fromUser = resUser ? resolveUserName(resUser, email) : "";
  if (fromUser) return fromUser;
  return resolveUserName(jwtPayload, email);
}

/** Construye User desde respuesta de login (PIN o clásico) o GET /me. */
export function parseUserFromLoginResponse(
  accessToken: string,
  resUser: Record<string, unknown> | undefined,
): User {
  const jwtPayload = decodeJwtPayload(accessToken);
  const userRecord = resUser ? extractAuthUserRecord(resUser) ?? resUser : undefined;
  const userId = userRecord?.id ?? userRecord?.user_id ?? jwtPayload.user_id ?? jwtPayload.sub;

  if (userRecord && userId != null) {
    const email = String(userRecord.email ?? jwtPayload.email ?? "");
    return mapUserFromApiResponse({
      id: String(userId),
      clinic_id: String(userRecord.clinic_id ?? jwtPayload.clinic_id ?? ""),
      name: resolveAuthUserName(userRecord, jwtPayload),
      email,
      role: normalizeRole(userRecord.role ?? jwtPayload.role),
      is_active: userRecord.is_active as boolean,
    });
  }

  const email = String(jwtPayload.email ?? "");
  return {
    id: String(jwtPayload.user_id ?? jwtPayload.sub ?? ""),
    clinic_id: String(jwtPayload.clinic_id ?? ""),
    name: resolveUserName(jwtPayload, email),
    email,
    role: normalizeRole(jwtPayload.role),
    is_active: true,
  };
}
