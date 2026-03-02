import {
  LayoutDashboard,
  Package,
  Warehouse,
  Lock,
  ClipboardList,
  Users,
  ScrollText,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Productos", url: "/products", icon: Package },
  { title: "Inventario", url: "/inventory", icon: Warehouse },
  { title: "Lockers", url: "/lockers", icon: Lock },
  { title: "Órdenes", url: "/open-orders", icon: ClipboardList },
];

const adminNav = [
  { title: "Usuarios", url: "/users", icon: Users },
  { title: "Auditoría", url: "/audit-logs", icon: ScrollText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">ERP</span>
          </div>
          {!collapsed && (
            <div className="animate-slide-in">
              <div className="font-semibold text-sidebar-foreground text-sm">LockerHub</div>
              <div className="text-[11px] text-sidebar-foreground/60">Sistema de gestión</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Operaciones
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-3 bg-sidebar-border" />
        {!collapsed && user && (
          <div className="px-2 mb-2 animate-fade-in">
            <div className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</div>
            <div className="mt-1">
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-sidebar-primary/20 text-sidebar-primary">
                {user.role}
              </span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={logout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Cerrar sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
