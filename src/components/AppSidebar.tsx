import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { configNav, mainNav, managementNav } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUserMenu } from "@/components/SidebarUserMenu";
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
  items,
  collapsed,
  isActive,
  onNavigate,
}: {
  items: typeof mainNav;
  collapsed: boolean;
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="p-2">
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

  const groups = [
    filterNav(mainNav, can, hasPermission),
    filterNav(managementNav, can, hasPermission),
    filterNav(configNav, can, hasPermission),
  ].filter((items) => items.length > 0);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`p-3 ${collapsed ? "flex items-center justify-center" : ""}`}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
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
        {groups.map((items, index) => (
          <div key={items.map((item) => item.url).join("|")}>
            {index > 0 && <SidebarSeparator className="my-1" />}
            <NavGroup
              items={items}
              collapsed={collapsed}
              isActive={isActive}
              onNavigate={closeMobileMenu}
            />
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className={`p-3 ${collapsed ? "items-center" : ""}`}>
        <SidebarUserMenu user={user} collapsed={collapsed} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
