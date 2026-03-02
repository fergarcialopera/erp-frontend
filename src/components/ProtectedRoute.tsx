import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { Role } from "@/types/models";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, can } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
