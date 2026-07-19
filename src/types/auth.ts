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

/** Modo del formulario email/contraseña en el wizard de login. */
export type ClassicLoginMode = "clinic-admin" | "super-admin";

/** Roles operativos dentro de una clínica (jerarquía inclusiva). */
export type ClinicRole = Exclude<Role, "SUPER_ADMIN">;

export const CLINIC_ROLE_HIERARCHY: Record<ClinicRole, number> = {
  ADMIN: 3,
  TECHNICIAN: 2,
  STAFF: 1,
};

export function isSuperAdmin(role: Role | undefined | null): boolean {
  return role === "SUPER_ADMIN";
}

export function isClinicRole(role: Role): role is ClinicRole {
  return role !== "SUPER_ADMIN";
}

export function hasClinicPermission(userRole: Role, requiredRole: ClinicRole): boolean {
  if (!isClinicRole(userRole)) return false;
  return CLINIC_ROLE_HIERARCHY[userRole] >= CLINIC_ROLE_HIERARCHY[requiredRole];
}

/** Compatibilidad con guards basados en rol mínimo de clínica. */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  if (requiredRole === "SUPER_ADMIN") return userRole === "SUPER_ADMIN";
  if (isSuperAdmin(userRole)) return false;
  if (!isClinicRole(requiredRole)) return false;
  return hasClinicPermission(userRole, requiredRole);
}

export function canAccessClinicApp(role: Role | undefined | null): boolean {
  return !!role && !isSuperAdmin(role);
}

export function canAccessOperations(role: Role): boolean {
  return hasClinicPermission(role, "STAFF");
}

/** TECHNICIAN+: entradas de stock, inventario operativo, incidencias. */
export function canAccessManagement(role: Role): boolean {
  return hasClinicPermission(role, "TECHNICIAN");
}

/** ADMIN de clínica: ajustes de inventario y visibilidad por clínica. */
export function canAccessConfig(role: Role): boolean {
  return hasClinicPermission(role, "ADMIN");
}

export function canAccessAudit(role: Role): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageCatalogProducts(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageCatalogAmbientes(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

/** CRUD de categorías, subcategorías, marcas, proveedores, tipos y roles operativos. */
export function canManageCatalogs(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

/** Relaciones producto-proveedor, marca-proveedor y tipo-rol. */
export function canEditProductRelations(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

/** ADMIN: activar producto en clínica y controlar visibilidad en salidas. */
export function canToggleProductClinicSettings(role: Role): boolean {
  return role === "ADMIN";
}

export function canToggleAmbienteClinicSettings(role: Role): boolean {
  return role === "ADMIN";
}

export function canEditIncidents(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

export type AuthPermission = "clinicApp" | "superAdminPlatform" | "audit" | "manageUsers";

export function hasAuthPermission(
  role: Role | undefined | null,
  permission: AuthPermission,
): boolean {
  if (!role) return false;
  switch (permission) {
    case "clinicApp":
      return canAccessClinicApp(role);
    case "superAdminPlatform":
      return isSuperAdmin(role);
    case "audit":
      return canAccessAudit(role);
    case "manageUsers":
      return canManageUsers(role);
    default:
      return false;
  }
}
