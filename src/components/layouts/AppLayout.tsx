import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/app/providers/useAuth";
import { getUserDisplayName, getUserInitial } from "@/lib/userDisplay";
import { Separator } from "@/components/ui/separator";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Productos",
  "/inventory": "Inventario",
  "/ambientes": "Ambientes",
  "/exit-logs": "Salidas de stock",
  "/exit-logs/new": "Nueva salida",
  "/incidents": "Incidencias",
  "/incidents/new": "Nueva incidencia",
  "/users": "Usuarios",
  "/audit-logs": "Registro de Auditoría",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/ambientes/")) return "Detalle de ambiente";
  return "LockERP";
}

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const title = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full min-w-0 overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="h-14 flex items-center gap-2 sm:gap-3 border-b bg-card px-3 sm:px-4 shrink-0 min-w-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-sm font-semibold truncate">{title}</h1>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {getUserDisplayName(user)}
              </span>
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[11px] font-medium text-primary-foreground">
                  {getUserInitial(user)}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto min-w-0">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
