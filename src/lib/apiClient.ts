import axios, { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { getApiBaseUrl, ENDPOINTS } from "@/config/endpoints";

/** Cliente axios: baseURL = API_BASE_URL + API_BASEPATH; rutas desde config/endpoints. */
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

/** Añade Authorization Bearer y X-Clinic-Id (modo configurable; default = header). */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    const clinicId = localStorage.getItem("clinic_id");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (clinicId && config.headers) {
      config.headers["X-Clinic-Id"] = clinicId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes(ENDPOINTS.AUTH.LOGIN);
    if (error.response?.status === 401 && !isLoginRequest) {
      // 401 en otras rutas = sesión expirada, cerrar y redirigir.
      // 401 en login = credenciales inválidas; no redirigir, dejar que Login maneje el error.
      localStorage.removeItem("auth_token");
      localStorage.removeItem("clinic_id");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Sin permisos", {
        description: "No tienes los accesos necesarios para esta acción.",
      });
    } else if (!isLoginRequest) {
      // No mostrar toast en login; el formulario ya muestra el error.
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Ocurrió un error inesperado";
      toast.error("Error", { description: message });
    }
    return Promise.reject(error);
  },
);
