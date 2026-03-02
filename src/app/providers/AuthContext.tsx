import React, { createContext, useState, useCallback } from "react";
import { User, Role } from "@/types/models";
import { AuthState, hasPermission } from "@/types/auth";
import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/config/endpoints";
import { LOGIN_FORMAT, LOGIN_USER_FIELD } from "@/config/env";

/** Decodifica el payload de un JWT (parte central, base64url). */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  can: (requiredRole: Role) => boolean;
  isRole: (role: Role) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

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
    const isForm = LOGIN_FORMAT === "form";
    const body = isForm
      ? new URLSearchParams({
          [LOGIN_USER_FIELD]: email,
          password,
        })
      : { [LOGIN_USER_FIELD]: email, password };
    const config = isForm
      ? { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      : undefined;
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, body, config);
    // Formato: { access_token, token_type, expires_in }
    const res = (data ?? {}) as Record<string, unknown>;
    const token = (res.access_token ?? res.token) as string | undefined;

    if (!token) {
      throw new Error("La respuesta no incluye token");
    }

    // Extraer user del payload del JWT (sub, clinic_id, role, etc.)
    const jwtPayload = decodeJwtPayload(token);
    const user: User = {
      id: String(jwtPayload.sub ?? ""),
      clinic_id: String(jwtPayload.clinic_id ?? ""),
      name: String(jwtPayload.name ?? jwtPayload.sub ?? ""),
      email: String(jwtPayload.email ?? ""),
      role: (jwtPayload.role as Role) ?? "READONLY",
      is_active: true,
    };
    const clinicId = user.clinic_id || undefined;

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
