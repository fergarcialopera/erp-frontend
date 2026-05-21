/** Modo de autorización para peticiones axios (ver interceptor en apiClient). */
export type AuthRequestMode = "none" | "clinic" | "user";

export function withAuthMode(mode: AuthRequestMode): { authMode: AuthRequestMode } {
  return { authMode: mode };
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    authMode?: AuthRequestMode;
  }
}
