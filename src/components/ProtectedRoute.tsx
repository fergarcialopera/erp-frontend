import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/useAuth";
import { Role } from "@/types/models";
import type { AuthPermission } from "@/types/auth";
import LandingPage from "@/features/landing/LandingPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: AuthPermission;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, can, hasPermission: checkPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-6xl font-bold text-muted-foreground/30 mb-2">403</div>
        <h2 className="text-lg font-semibold mb-1">Acceso denegado</h2>
        <p className="text-sm text-muted-foreground">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  if (requiredRole && !can(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-6xl font-bold text-muted-foreground/30 mb-2">403</div>
        <h2 className="text-lg font-semibold mb-1">Acceso denegado</h2>
        <p className="text-sm text-muted-foreground">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Landing pública si no hay sesión; con sesión, home por rol. */
export function RoleHomeRedirect() {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (hasPermission("superAdminPlatform")) {
    return <Navigate to="/platform" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

/** Bloquea el ERP clínico para SUPER_ADMIN (plataforma global). */
export function ClinicAppGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission("clinicApp")) {
    return <Navigate to="/platform" replace />;
  }

  return <>{children}</>;
}

/** Solo SUPER_ADMIN dentro del layout de plataforma. */
export function PlatformAppGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission("superAdminPlatform")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
