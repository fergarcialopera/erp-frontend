import { LogOut } from "lucide-react";
import type { User } from "@/types/models";
import { getUserDisplayName, getUserInitial } from "@/lib/userDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarUserMenuProps {
  user: Pick<User, "name" | "email" | "role"> | null | undefined;
  roleLabel?: string;
  collapsed?: boolean;
  onLogout: () => void | Promise<void>;
}

export function SidebarUserMenu({
  user,
  roleLabel,
  collapsed = false,
  onLogout,
}: SidebarUserMenuProps) {
  const { isMobile } = useSidebar();
  const displayName = getUserDisplayName(user);
  const initial = getUserInitial(user);
  const role = roleLabel ?? user?.role ?? "";
  const menuCollapsed = collapsed && !isMobile;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2 overflow-hidden rounded-xl px-0.5 outline-none transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hover:bg-transparent"
          aria-label="Menú de usuario"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-primary-foreground">{initial}</span>
          </span>
          <span className="min-w-0 max-w-[10rem] flex-1 overflow-hidden text-left opacity-100 transition-[opacity,max-width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="block truncate whitespace-nowrap text-xs font-medium text-sidebar-foreground">
              {displayName}
            </span>
            <span className="block truncate whitespace-nowrap text-[10px] text-sidebar-foreground/50">
              {role}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={menuCollapsed ? "right" : "top"}
        align={menuCollapsed ? "end" : "start"}
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.email ? (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
            {role ? (
              <span className="mt-0.5 inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary/15 text-[hsl(var(--ll-turquoise-600))]">
                {role}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => {
            void onLogout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
