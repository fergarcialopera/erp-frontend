import axios, { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getApiBaseUrl, ENDPOINTS } from "@/config/endpoints";
import {
  getAccessToken,
  getClinicAccessToken,
  clearAllSessions,
} from "@/lib/authStorage";
import type { AuthRequestMode } from "@/lib/authRequest";

/** Cliente axios: baseURL = API_BASE_URL + API_BASEPATH; rutas desde config/endpoints. */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_PATH_PREFIX = "/auth/";

function isAuthFlowRequest(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes(AUTH_PATH_PREFIX) || url.includes(ENDPOINTS.AUTH.ME);
}

/** Añade Bearer según authMode: user (ERP), clinic (staff/PIN) o none (público). */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const mode: AuthRequestMode = config.authMode ?? "user";
    if (!config.headers) return config;

    if (mode === "user") {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } else if (mode === "clinic") {
      const clinicToken = getClinicAccessToken();
      if (clinicToken) {
        config.headers.Authorization = `Bearer ${clinicToken}`;
      } else {
        delete config.headers.Authorization;
      }
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url as string | undefined;
    const isAuthRequest = isAuthFlowRequest(url);
    const authMode = error.config?.authMode as AuthRequestMode | undefined;

    if (error.response?.status === 401 && !isAuthRequest) {
      clearAllSessions();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Sin permisos", {
        description: "No tienes los accesos necesarios para esta acción.",
      });
    } else if (!isAuthRequest || (authMode === "user" && !url?.includes("/login"))) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Ocurrió un error inesperado";
      if (!isAuthRequest) {
        toast.error("Error", { description: message });
      }
    }
    return Promise.reject(error);
  },
);
