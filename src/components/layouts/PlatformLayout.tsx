import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PlatformSidebar } from "@/components/PlatformSidebar";
import { useAuth } from "@/app/providers/useAuth";
import { getPlatformPageTitle } from "@/config/platformNavigation";
import { getUserDisplayName, getUserInitial } from "@/lib/userDisplay";
import { Separator } from "@/components/ui/separator";

export default function PlatformLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const title = getPlatformPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full min-w-0 overflow-x-hidden">
        <PlatformSidebar />
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
            <div className="animate-fade-in max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
