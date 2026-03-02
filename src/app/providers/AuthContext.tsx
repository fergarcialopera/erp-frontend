import React, { createContext, useContext, useState, useCallback } from "react";
import { User, Role } from "@/types/models";
import { AuthState, hasPermission } from "@/types/auth";
import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  can: (requiredRole: Role) => boolean;
  isRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem("auth_token");
    const clinicId = localStorage.getItem("clinic_id");
    const userStr = localStorage.getItem("auth_user");
    const user = userStr ? (JSON.parse(userStr) as User) : null;

    return {
      token,
      clinicId,
      user,
      isAuthenticated: !!token && !!user,
    };
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<{ token: string; user: User; clinic_id?: string }>(
      ENDPOINTS.AUTH.LOGIN,
      { email, password },
    );
    const { token, user, clinic_id } = data;
    const clinicId = clinic_id ?? user.clinic_id;

    localStorage.setItem("auth_token", token);
    if (clinicId) localStorage.setItem("clinic_id", clinicId);
    localStorage.setItem("auth_user", JSON.stringify(user));

    setState({
      token,
      clinicId: clinicId ?? null,
      user,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      // Llamar al backend para invalidar el token (blacklist/revocación de sesión).
      // El token actual se envía en el header; el backend debe marcarlo como inválido.
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Si el backend falla (red, 401, etc.), igual cerramos sesión en el cliente.
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("clinic_id");
      localStorage.removeItem("auth_user");
      setState({ token: null, clinicId: null, user: null, isAuthenticated: false });
      // Recarga completa: evita tokens en memoria, cache de React Query y estado residual.
      // El token queda invalidado en el cliente; el backend debe haberlo revocado.
      window.location.href = "/login";
    }
  }, []);

  const can = useCallback(
    (requiredRole: Role) => {
      if (!state.user) return false;
      return hasPermission(state.user.role, requiredRole);
    },
    [state.user],
  );

  const isRole = useCallback((role: Role) => state.user?.role === role, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, can, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
