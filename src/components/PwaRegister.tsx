import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

/** Registra el service worker y avisa si hay una nueva versión lista. */
export function PwaRegister() {
  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast.message("Hay una nueva versión de LogiLock", {
          description: "Recarga para actualizar la aplicación instalada.",
          action: {
            label: "Actualizar",
            onClick: () => {
              void updateSW(true);
            },
          },
          duration: 20_000,
        });
      },
      onOfflineReady() {
        // Silencioso: la app puede abrirse offline para el shell estático.
      },
    });
  }, []);

  return null;
}
