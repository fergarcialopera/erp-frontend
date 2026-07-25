import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface DestructiveAction {
  label: string;
  onClick: () => void;
  isPending?: boolean;
}

interface FormDialogFooterProps {
  /** Texto del botón de envío; el llamador decide el estado (p. ej. "Guardando…"). */
  submitLabel: string;
  /** Deshabilita el botón de envío mientras la mutación está en curso. */
  isPending?: boolean;
  onCancel: () => void;
  /** Acción destructiva opcional (desactivar/eliminar), mostrada como texto a la izquierda. */
  destructiveAction?: DestructiveAction;
}

/**
 * Pie estándar de los modales de formulario. Centraliza la jerarquía visual:
 * envío como botón primario, cancelar en segundo plano (ghost) y la acción
 * destructiva como texto clicable de baja prominencia.
 */
export function FormDialogFooter({
  submitLabel,
  isPending,
  onCancel,
  destructiveAction,
}: FormDialogFooterProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      {destructiveAction ? (
        <Button
          type="button"
          variant="link"
          className="h-auto min-h-0 gap-1.5 px-0 text-destructive sm:mr-auto"
          onClick={destructiveAction.onClick}
          disabled={destructiveAction.isPending}
        >
          <Trash2 className="h-4 w-4" />
          {destructiveAction.label}
        </Button>
      ) : null}
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </DialogFooter>
  );
}
