import { Role, User } from "./models";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  /** Opcional: si no viene, se usa user.clinic_id */
  clinic_id?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  clinicId: string | null;
  isAuthenticated: boolean;
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  TECHNICIAN: 2,
  STAFF: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** Operaciones diarias (salidas, dashboard). */
export function canAccessOperations(userRole: Role): boolean {
  return hasPermission(userRole, "STAFF");
}

/** Gestión de catálogo, lockers e inventario (no configuración del sistema). */
export function canAccessManagement(userRole: Role): boolean {
  return hasPermission(userRole, "TECHNICIAN");
}

/** Usuarios, auditoría y ajustes de clínica. */
export function canAccessConfig(userRole: Role): boolean {
  return hasPermission(userRole, "ADMIN");
}
