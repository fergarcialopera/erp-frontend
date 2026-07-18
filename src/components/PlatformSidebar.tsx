import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { platformNav } from "@/config/platformNavigation";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUserMenu } from "@/components/SidebarUserMenu";

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

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
              Plataforma global
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="!p-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/platform"}
                      onClick={closeMobileMenu}
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
      </SidebarContent>

      <SidebarFooter className="!p-3">
        <SidebarUserMenu
          user={user}
          roleLabel="SUPER_ADMIN"
          collapsed={collapsed}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
