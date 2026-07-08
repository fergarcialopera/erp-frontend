import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Lock,
  AlertTriangle,
  ScrollText,
} from "lucide-react";

export type PlatformNavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  description?: string;
};

export const platformNav: PlatformNavItem[] = [
  {
    title: "Inicio",
    url: "/platform",
    icon: LayoutDashboard,
    description: "Resumen de la plataforma",
  },
  {
    title: "Clínicas",
    url: "/platform/clinics",
    icon: Building2,
    description: "Alta, edición y visibilidad",
  },
  {
    title: "Usuarios",
    url: "/platform/users",
    icon: Users,
    description: "Gestión global de cuentas",
  },
  {
    title: "Productos",
    url: "/platform/products",
    icon: Package,
    description: "Catálogo global",
  },
  {
    title: "Ambientes",
    url: "/platform/ambientes",
    icon: Lock,
    description: "Ambientes y zonas",
  },
  {
    title: "Incidencias",
    url: "/platform/incidents",
    icon: AlertTriangle,
    description: "Seguimiento y resolución",
  },
  {
    title: "Auditoría",
    url: "/platform/audit-logs",
    icon: ScrollText,
    description: "Historial de acciones",
  },
];

export const PLATFORM_PAGE_TITLES: Record<string, string> = {
  "/platform": "Plataforma global",
  "/platform/clinics": "Clínicas",
  "/platform/users": "Usuarios",
  "/platform/products": "Productos",
  "/platform/ambientes": "Ambientes",
  "/platform/incidents": "Incidencias",
  "/platform/audit-logs": "Auditoría",
};

export function getPlatformPageTitle(pathname: string): string {
  if (PLATFORM_PAGE_TITLES[pathname]) return PLATFORM_PAGE_TITLES[pathname];
  if (pathname.startsWith("/platform/clinics/")) return "Detalle de clínica";
  if (pathname.startsWith("/platform/ambientes/")) return "Detalle de ambiente";
  return "LogiLock Plataforma";
}
