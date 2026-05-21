import {
  LayoutDashboard,
  Package,
  Warehouse,
  Lock,
  ClipboardList,
  AlertTriangle,
  Users,
  ScrollText,
} from "lucide-react";
import type { Role } from "@/types/models";

/** Jerarquía: STAFF (1) < TECHNICIAN (2) < ADMIN (3) — ver `hasPermission` en types/auth. */
export const ROLE_MIN = {
  /** Dashboard, salidas de stock. */
  OPERATIONS: "STAFF",
  /** Inventario, incidencias, productos, lockers. */
  MANAGEMENT: "TECHNICIAN",
  /** Usuarios, auditoría y ajustes de clínica (configuración). */
  CONFIG: "ADMIN",
} as const satisfies Record<string, Role>;

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  /** Rol mínimo (jerarquía STAFF < TECHNICIAN < ADMIN). */
  requiredRole: Role;
};

/** Roles mínimos por ruta protegida (alineado con App.tsx). */
export const ROUTE_MIN_ROLE = {
  products: ROLE_MIN.MANAGEMENT,
  inventory: ROLE_MIN.MANAGEMENT,
  lockers: ROLE_MIN.MANAGEMENT,
  lockerDetail: ROLE_MIN.MANAGEMENT,
  incidents: ROLE_MIN.MANAGEMENT,
  incidentsNew: ROLE_MIN.MANAGEMENT,
  users: ROLE_MIN.CONFIG,
  auditLogs: ROLE_MIN.CONFIG,
} as const;

/** Vistas operativas del día a día. */
export const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredRole: ROLE_MIN.OPERATIONS },
  { title: "Inventario", url: "/inventory", icon: Warehouse, requiredRole: ROLE_MIN.MANAGEMENT },
  { title: "Salidas de stock", url: "/exit-logs", icon: ClipboardList, requiredRole: ROLE_MIN.OPERATIONS },
  { title: "Incidencias", url: "/incidents", icon: AlertTriangle, requiredRole: ROLE_MIN.MANAGEMENT },
];

/** Catálogo y lockers (técnico+, no es configuración del sistema). */
export const managementNav: NavItem[] = [
  { title: "Productos", url: "/products", icon: Package, requiredRole: ROLE_MIN.MANAGEMENT },
  { title: "Lockers", url: "/lockers", icon: Lock, requiredRole: ROLE_MIN.MANAGEMENT },
];

/** Solo administración / configuración (usuarios, auditoría, ajustes API). */
export const configNav: NavItem[] = [
  { title: "Usuarios", url: "/users", icon: Users, requiredRole: ROLE_MIN.CONFIG },
  { title: "Auditoría", url: "/audit-logs", icon: ScrollText, requiredRole: ROLE_MIN.CONFIG },
];
