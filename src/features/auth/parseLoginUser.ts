import { User, Role, mapUserFromApiResponse } from "@/types/models";

function normalizeRole(role: unknown): Role {
  if (role === "ADMIN" || role === "TECHNICIAN" || role === "STAFF") return role;
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

function getNameFromJwtPayload(payload: Record<string, unknown>): string {
  const name =
    payload.name ??
    payload.nombre ??
    payload.full_name ??
    payload.preferred_username ??
    payload.email;
  if (name != null && String(name).trim() !== "") return String(name).trim();
  return "";
}

/** Construye User desde respuesta de login (PIN o clásico). */
export function parseUserFromLoginResponse(
  accessToken: string,
  resUser: Record<string, unknown> | undefined,
): User {
  const jwtPayload = decodeJwtPayload(accessToken);

  if (resUser && typeof resUser === "object" && resUser.id != null) {
    return mapUserFromApiResponse({
      id: resUser.id as string,
      clinic_id: (resUser.clinic_id as string) ?? (jwtPayload.clinic_id as string),
      name: (resUser.name as string) ?? getNameFromJwtPayload(jwtPayload),
      email: resUser.email as string,
      role: normalizeRole(resUser.role ?? jwtPayload.role),
      is_active: resUser.is_active as boolean,
    });
  }

  const displayName = getNameFromJwtPayload(jwtPayload);
  return {
    id: String(jwtPayload.sub ?? ""),
    clinic_id: String(jwtPayload.clinic_id ?? ""),
    name: displayName || String(jwtPayload.email ?? ""),
    email: String(jwtPayload.email ?? ""),
    role: normalizeRole(jwtPayload.role),
    is_active: true,
  };
}
