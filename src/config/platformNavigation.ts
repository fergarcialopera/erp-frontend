import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Lock,
  AlertTriangle,
  ScrollText,
  Tags,
  Layers,
  Award,
  Truck,
  Pill,
  Shield,
} from "lucide-react";

export type PlatformNavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  description?: string;
  /** Agrupa ítems bajo una sección en el sidebar. */
  section?: string;
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
    title: "Categorías",
    url: "/platform/categories",
    icon: Tags,
    description: "Categorías de producto",
    section: "Catálogos",
  },
  {
    title: "Subcategorías",
    url: "/platform/subcategories",
    icon: Layers,
    description: "Subcategorías de producto",
    section: "Catálogos",
  },
  {
    title: "Marcas",
    url: "/platform/brands",
    icon: Award,
    description: "Marcas y proveedores",
    section: "Catálogos",
  },
  {
    title: "Proveedores",
    url: "/platform/suppliers",
    icon: Truck,
    description: "Proveedores del catálogo",
    section: "Catálogos",
  },
  {
    title: "Tipos de dispensación",
    url: "/platform/dispensing-types",
    icon: Pill,
    description: "Tipos y roles permitidos",
    section: "Catálogos",
  },
  {
    title: "Roles operativos",
    url: "/platform/roles",
    icon: Shield,
    description: "Roles de locker",
    section: "Catálogos",
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
  "/platform/categories": "Categorías",
  "/platform/subcategories": "Subcategorías",
  "/platform/brands": "Marcas",
  "/platform/suppliers": "Proveedores",
  "/platform/dispensing-types": "Tipos de dispensación",
  "/platform/roles": "Roles operativos",
  "/platform/ambientes": "Ambientes",
  "/platform/incidents": "Incidencias",
  "/platform/audit-logs": "Auditoría",
  "/platform/audit-logs/access": "Auditoría · Accesos",
  "/platform/audit-logs/activity": "Auditoría · Actividad",
};

export function getPlatformPageTitle(pathname: string): string {
  if (PLATFORM_PAGE_TITLES[pathname]) return PLATFORM_PAGE_TITLES[pathname];
  if (pathname.startsWith("/platform/clinics/")) return "Detalle de clínica";
  if (pathname.startsWith("/platform/ambientes/")) return "Detalle de ambiente";
  return "LogiLock Plataforma";
}
