import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User, Role } from "@/types/models";
import { AuthState, hasPermission } from "@/types/auth";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
    const { data } = await apiClient.post(ENDPOINTS.auth.login, { email, password });
    const { token, user, clinic_id } = data;

    localStorage.setItem("auth_token", token);
    localStorage.setItem("clinic_id", clinic_id);
    localStorage.setItem("auth_user", JSON.stringify(user));

    setState({
      token,
      clinicId: clinic_id,
      user,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("clinic_id");
    localStorage.removeItem("auth_user");
    setState({ token: null, clinicId: null, user: null, isAuthenticated: false });
  }, []);

  const can = useCallback(
    (requiredRole: Role) => {
      if (!state.user) return false;
      return hasPermission(state.user.role, requiredRole);
    },
    [state.user]
  );

  const isRole = useCallback(
    (role: Role) => state.user?.role === role,
    [state.user]
  );

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
