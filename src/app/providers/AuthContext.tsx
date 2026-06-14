import React, { createContext, useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/models";
import {
  AuthState,
  canAccessAudit,
  canAccessClinicApp,
  canAccessConfig,
  canAccessManagement,
  canAccessOperations,
  canEditIncidents,
  canManageCatalogAmbientes,
  canManageCatalogProducts,
  canManageUsers,
  canToggleAmbienteClinicSettings,
  canToggleProductClinicSettings,
  hasAuthPermission,
  hasPermission,
  isSuperAdmin,
} from "@/types/auth";
import type { AuthPermission } from "@/types/auth";
import { Role } from "@/types/models";
import {
  getAccessToken,
  getClinicAccessToken,
  getClinicId,
  getClinicName,
  getAuthUserJson,
  setAccessToken,
  setClinicAccessToken,
  setClinicId,
  setClinicName,
  setAuthUserJson,
  clearUserSession,
  clearClinicSession,
  clearClinicMeta,
  clearAllSessions,
} from "@/lib/authStorage";
import {
  loginClinic as apiLoginClinic,
  loginWithPin as apiLoginPin,
  loginWithPassword,
  loginWithPasswordAutoClinic,
  logoutUserApi,
  logoutClinicApi,
  fetchMe,
} from "@/features/auth/api";
import { SuperAdminLoginError } from "@/features/auth/errors";
import type { ClinicLoginResult, UserLoginResult } from "@/types/auth";
import { AUTH_STAFF_QUERY_ROOT } from "@/features/auth/queryKeys";

function loadUserFromStorage(): User | null {
  const raw = getAuthUserJson();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function readInitialState(): AuthState {
  const accessToken = getAccessToken();
  const clinicAccessToken = getClinicAccessToken();
  const user = loadUserFromStorage();
  return {
    accessToken,
    clinicAccessToken,
    clinicId: getClinicId(),
    clinicName: getClinicName(),
    user,
    isAuthenticated: !!accessToken && !!user,
    hasClinicSession: !!clinicAccessToken,
  };
}

function applyUserLoginResult(result: UserLoginResult): Pick<
  AuthState,
  "accessToken" | "user" | "isAuthenticated" | "clinicId"
> {
  setAccessToken(result.access_token);
  setAuthUserJson(JSON.stringify(result.user));

  if (isSuperAdmin(result.user.role)) {
    clearClinicSession();
    clearClinicMeta();
    return {
      accessToken: result.access_token,
      user: result.user,
      isAuthenticated: true,
      clinicId: null,
    };
  }

  const clinicId = result.user.clinic_id || getClinicId() || null;
  if (clinicId) {
    setClinicId(clinicId);
  } else {
    clearClinicMeta();
  }
  return {
    accessToken: result.access_token,
    user: result.user,
    isAuthenticated: true,
    clinicId: clinicId ?? null,
  };
}

interface AuthContextType extends AuthState {
  /** Alias de accessToken (compatibilidad). */
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  /** Login global (sin token de clínica); solo acepta cuentas SUPER_ADMIN. */
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  loginClinic: (clinicId: string, password: string) => Promise<ClinicLoginResult>;
  loginPin: (
    userId: string,
    pin: string,
    profile?: Pick<User, "name" | "email">,
  ) => Promise<void>;
  applyClinicSession: (result: ClinicLoginResult) => void;
  logout: () => Promise<void>;
  logoutUser: () => Promise<void>;
  logoutClinic: () => Promise<void>;
  logoutAll: () => Promise<void>;
  can: (requiredRole: Role) => boolean;
  isRole: (role: Role) => boolean;
  hasPermission: (permission: AuthPermission) => boolean;
  isSuperAdmin: () => boolean;
  canAccessClinicApp: () => boolean;
  canAccessOperations: () => boolean;
  canAccessManagement: () => boolean;
  canAccessConfig: () => boolean;
  canAccessAudit: () => boolean;
  canManageUsers: () => boolean;
  canManageCatalogProducts: () => boolean;
  canManageCatalogAmbientes: () => boolean;
  canToggleProductClinicSettings: () => boolean;
  canToggleAmbienteClinicSettings: () => boolean;
  canEditIncidents: () => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(readInitialState);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setBootstrapped(true);
      return;
    }
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        setAuthUserJson(JSON.stringify(user));
        setState((prev) => ({
          ...prev,
          user,
          accessToken: token,
          isAuthenticated: true,
          clinicId: user.clinic_id || prev.clinicId,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        clearUserSession();
        setState((prev) => ({
          ...prev,
          accessToken: null,
          user: null,
          isAuthenticated: false,
        }));
      })
      .finally(() => {
        if (!cancelled) setBootstrapped(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyClinicSession = useCallback((result: ClinicLoginResult) => {
    clearClinicMeta();
    setClinicAccessToken(result.clinic_access_token);
    setClinicId(result.clinic.id);
    setClinicName(result.clinic.name);
    setState((prev) => ({
      ...prev,
      clinicAccessToken: result.clinic_access_token,
      clinicId: result.clinic.id,
      clinicName: result.clinic.name,
      hasClinicSession: true,
    }));
  }, []);

  const loginClinic = useCallback(async (clinicId: string, password: string) => {
    const result = await apiLoginClinic(clinicId, password);
    applyClinicSession(result);
    return result;
  }, [applyClinicSession]);

  const completeUserLogin = useCallback(
    (result: UserLoginResult, profile?: Pick<User, "name" | "email">) => {
      const user =
        profile?.name && !result.user.name.trim()
          ? { ...result.user, name: profile.name, email: result.user.email || profile.email || "" }
          : result.user;
      const patch = applyUserLoginResult({ ...result, user });
      const superAdminSession = isSuperAdmin(user.role);
      setState((prev) => ({
        ...prev,
        ...patch,
        ...(superAdminSession
          ? {
              clinicAccessToken: null,
              clinicName: null,
              hasClinicSession: false,
            }
          : {}),
      }));
    },
    [],
  );

  const loginPin = useCallback(
    async (userId: string, pin: string, profile?: Pick<User, "name" | "email">) => {
      const result = await apiLoginPin(userId, pin);
      completeUserLogin(result, profile);
    },
    [completeUserLogin],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginWithPasswordAutoClinic(email, password);
      completeUserLogin(result);
    },
    [completeUserLogin],
  );

  const loginSuperAdmin = useCallback(
    async (email: string, password: string) => {
      try {
        if (getClinicAccessToken()) await logoutClinicApi();
      } catch {
        /* cerrar en cliente aunque falle el backend */
      }
      clearClinicSession();
      clearClinicMeta();
      queryClient.removeQueries({ queryKey: AUTH_STAFF_QUERY_ROOT });

      const result = await loginWithPassword(email, password, { useClinicToken: false });
      if (!isSuperAdmin(result.user.role)) {
        clearUserSession();
        throw new SuperAdminLoginError();
      }
      completeUserLogin(result);
    },
    [completeUserLogin, queryClient],
  );

  const logoutUser = useCallback(async () => {
    try {
      if (getAccessToken()) await logoutUserApi();
    } catch {
      /* cerrar en cliente aunque falle el backend */
    } finally {
      clearUserSession();
      setState((prev) => ({
        ...prev,
        accessToken: null,
        user: null,
        isAuthenticated: false,
        clinicId: prev.hasClinicSession ? prev.clinicId : null,
      }));
    }
  }, []);

  const logoutClinic = useCallback(async () => {
    try {
      if (getClinicAccessToken()) await logoutClinicApi();
    } catch {
      /* ignore */
    } finally {
      clearClinicSession();
      queryClient.removeQueries({ queryKey: AUTH_STAFF_QUERY_ROOT });
      setState((prev) => ({
        ...prev,
        clinicAccessToken: null,
        clinicId: null,
        clinicName: null,
        hasClinicSession: false,
      }));
    }
  }, [queryClient]);

  const logoutAll = useCallback(async () => {
    try {
      if (getAccessToken()) await logoutUserApi();
    } catch {
      /* ignore */
    }
    try {
      if (getClinicAccessToken()) await logoutClinicApi();
    } catch {
      /* ignore */
    }
    clearAllSessions();
    setState({
      accessToken: null,
      clinicAccessToken: null,
      clinicId: null,
      clinicName: null,
      user: null,
      isAuthenticated: false,
      hasClinicSession: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await logoutAll();
    window.location.href = "/login";
  }, [logoutAll]);

  const can = useCallback(
    (requiredRole: Role) => {
      if (!state.user) return false;
      return hasPermission(state.user.role, requiredRole);
    },
    [state.user],
  );

  const isRole = useCallback((role: Role) => state.user?.role === role, [state.user]);

  const checkPermission = useCallback(
    (permission: AuthPermission) => hasAuthPermission(state.user?.role, permission),
    [state.user?.role],
  );

  const role = state.user?.role;
  const clinicId = state.user?.clinic_id ?? state.clinicId;

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        clinicId,
        token: state.accessToken,
        login,
        loginSuperAdmin,
        loginClinic,
        loginPin,
        applyClinicSession,
        logout,
        logoutUser,
        logoutClinic,
        logoutAll,
        can,
        isRole,
        hasPermission: checkPermission,
        isSuperAdmin: () => isSuperAdmin(role),
        canAccessClinicApp: () => (role ? canAccessClinicApp(role) : false),
        canAccessOperations: () => (role ? canAccessOperations(role) : false),
        canAccessManagement: () => (role ? canAccessManagement(role) : false),
        canAccessConfig: () => (role ? canAccessConfig(role) : false),
        canAccessAudit: () => (role ? canAccessAudit(role) : false),
        canManageUsers: () => (role ? canManageUsers(role) : false),
        canManageCatalogProducts: () => (role ? canManageCatalogProducts(role) : false),
        canManageCatalogAmbientes: () => (role ? canManageCatalogAmbientes(role) : false),
        canToggleProductClinicSettings: () =>
          role ? canToggleProductClinicSettings(role) : false,
        canToggleAmbienteClinicSettings: () =>
          role ? canToggleAmbienteClinicSettings(role) : false,
        canEditIncidents: () => (role ? canEditIncidents(role) : false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
