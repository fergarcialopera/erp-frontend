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
  isActive,
  onNavigate,
}: {
  items: typeof mainNav;
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="!p-3">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/dashboard"}
                  onClick={onNavigate}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  activeClassName="text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
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
      <SidebarHeader className="!p-3">
        <div className="flex h-10 items-center gap-2 overflow-hidden">
          <img
            src="/favicon/favicon.svg"
            alt=""
            className="h-8 w-8 shrink-0"
            width={32}
            height={32}
          />
          <div className="min-w-0 max-w-[11rem] overflow-hidden opacity-100 transition-[opacity,max-width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            <div className="whitespace-nowrap font-heading text-sm font-semibold text-sidebar-foreground">
              <span className="text-sidebar-primary">Logi</span>Lock
            </div>
            <div className="whitespace-nowrap text-[11px] text-sidebar-foreground/60">
              Sistema de gestión
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((items, index) => (
          <div key={items.map((item) => item.url).join("|")}>
            {index > 0 && <SidebarSeparator className="my-1" />}
            <NavGroup items={items} isActive={isActive} onNavigate={closeMobileMenu} />
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="!p-3">
        <SidebarUserMenu user={user} collapsed={collapsed} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
