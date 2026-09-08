import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PlatformSidebar } from "@/components/PlatformSidebar";
import { getPlatformPageTitle } from "@/config/platformNavigation";
import { Separator } from "@/components/ui/separator";

export default function PlatformLayout() {
  const location = useLocation();
  const title = getPlatformPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden bg-background">
        <PlatformSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="flex h-14 min-w-0 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:gap-3 sm:px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="truncate font-heading text-sm font-semibold">{title}</h1>
          </header>
          <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-4 md:px-4 md:py-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
