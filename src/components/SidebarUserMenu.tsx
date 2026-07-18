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
import { cn } from "@/lib/utils";

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
  const displayName = getUserDisplayName(user);
  const initial = getUserInitial(user);
  const role = roleLabel ?? user?.role ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl outline-none transition-colors",
            "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            collapsed ? "justify-center p-1" : "px-2 py-1.5",
          )}
          aria-label="Menú de usuario"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-primary-foreground">{initial}</span>
            <span
              className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-sidebar bg-[hsl(var(--ll-turquoise-500))]"
              aria-hidden
            />
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 text-left animate-fade-in">
              <span className="block truncate text-xs font-medium text-sidebar-foreground">
                {displayName}
              </span>
              <span className="block truncate text-[10px] text-sidebar-foreground/50">
                {role}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user?.email ? (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
