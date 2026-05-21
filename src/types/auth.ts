import { Role, User } from "./models";

export interface AuthClinicSummary {
  id: string;
  name: string;
  image_url: string | null;
  display_initial: string;
  visible?: boolean;
}

export interface AuthStaffMember {
  id: string;
  name: string;
  role: Role;
  image_url: string | null;
  display_initial: string;
}

export interface ClinicLoginResult {
  clinic_access_token: string;
  clinic: AuthClinicSummary;
  expires_in?: number;
}

export interface UserLoginResult {
  access_token: string;
  user: User;
  expires_in?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  clinic_id?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  clinicAccessToken: string | null;
  clinicId: string | null;
  clinicName: string | null;
  /** Sesión de usuario activa (token + user). */
  isAuthenticated: boolean;
  /** Token de clínica presente (flujo kiosk). */
  hasClinicSession: boolean;
}

export type LoginWizardStep =
  | "clinics"
  | "clinic-password"
  | "staff"
  | "pin"
  | "classic"
  | "locked";

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  TECHNICIAN: 2,
  STAFF: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessOperations(userRole: Role): boolean {
  return hasPermission(userRole, "STAFF");
}

export function canAccessManagement(userRole: Role): boolean {
  return hasPermission(userRole, "TECHNICIAN");
}

export function canAccessConfig(userRole: Role): boolean {
  return hasPermission(userRole, "ADMIN");
}
