import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { platformNav } from "@/config/platformNavigation";
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
import { LogOut, Shield } from "lucide-react";
import { getUserDisplayName } from "@/lib/userDisplay";
import { Separator } from "@/components/ui/separator";

export function PlatformSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isActive = (path: string) =>
    path === "/platform"
      ? location.pathname === "/platform"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in min-w-0">
              <div className="font-semibold text-sidebar-foreground text-sm truncate">LogiLock</div>
              <div className="text-[11px] text-sidebar-foreground/60">Plataforma global</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Administración
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/platform"}
                      onClick={closeMobileMenu}
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
                SUPER_ADMIN
              </span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
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
