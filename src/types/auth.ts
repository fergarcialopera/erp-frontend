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
