import { toast } from "sonner";
import { parseApiError } from "@/lib/apiError";

/** Toast de error de mutación de catálogo/productos. */
export function toastMutationError(err: unknown, fallback: string): void {
  const { status, detail } = parseApiError(err);
  if (status === 403) {
    toast.error("Sin permisos", {
      description: detail ?? "No tienes permiso para realizar esta acción.",
    });
    return;
  }
  if (status === 409) {
    toast.error("No se puede completar", {
      description: detail ?? "La entidad está en uso y no puede modificarse o eliminarse.",
    });
    return;
  }
  toast.error(fallback, { description: detail });
}
