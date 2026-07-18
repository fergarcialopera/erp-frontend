import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { configNav, mainNav, managementNav } from "@/config/navigation";
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
import { LogOut } from "lucide-react";
import { getUserDisplayName } from "@/lib/userDisplay";
import { Separator } from "@/components/ui/separator";

import type { AuthPermission } from "@/types/auth";

function filterNav<T extends { requiredRole: import("@/types/models").Role; requiredPermission?: AuthPermission }>(
  items: T[],
  can: (role: import("@/types/models").Role) => boolean,
  hasPermission: (permission: AuthPermission) => boolean,
): T[] {
  return items.filter(
    (item) =>
      can(item.requiredRole) &&
      (!item.requiredPermission || hasPermission(item.requiredPermission)),
  );
}

function NavGroup({
  label,
  items,
  collapsed,
  isActive,
  onNavigate,
}: {
  label: string;
  items: typeof mainNav;
  collapsed: boolean;
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/dashboard"}
                  onClick={onNavigate}
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
  );
}

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, can, hasPermission } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const visibleMainNav = filterNav(mainNav, can, hasPermission);
  const visibleManagementNav = filterNav(managementNav, can, hasPermission);
  const visibleConfigNav = filterNav(configNav, can, hasPermission);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img
            src="/favicon/favicon.svg"
            alt=""
            className="h-8 w-8 shrink-0"
            width={32}
            height={32}
          />
          {!collapsed && (
            <div className="animate-slide-in">
              <div className="font-heading text-sm font-semibold text-sidebar-foreground">
                <span className="text-sidebar-primary">Logi</span>Lock
              </div>
              <div className="text-[11px] text-sidebar-foreground/60">Sistema de gestión</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup
          label="Operaciones"
          items={visibleMainNav}
          collapsed={collapsed}
          isActive={isActive}
          onNavigate={closeMobileMenu}
        />
        <NavGroup
          label="Gestión"
          items={visibleManagementNav}
          collapsed={collapsed}
          isActive={isActive}
          onNavigate={closeMobileMenu}
        />
        <NavGroup
          label="Configuración"
          items={visibleConfigNav}
          collapsed={collapsed}
          isActive={isActive}
          onNavigate={closeMobileMenu}
        />
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-3 bg-sidebar-border" />
        {!collapsed && user && (
          <div className="px-2 mb-2 animate-fade-in">
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {getUserDisplayName(user)}
            </div>
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
              onClick={handleLogout}
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
