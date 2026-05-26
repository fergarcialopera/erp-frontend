import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpenDraftExitButtonProps {
  exitLogId: string;
  disabled?: boolean;
  loading?: boolean;
  onOpen: (exitLogId: string) => void;
}

export function OpenDraftExitButton({
  exitLogId,
  disabled,
  loading,
  onOpen,
}: OpenDraftExitButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 w-7 gap-0 px-0 sm:h-8 sm:w-auto sm:gap-2 sm:px-3 text-xs sm:text-sm"
      disabled={disabled || loading}
      onClick={() => onOpen(exitLogId)}
      aria-label={loading ? "Abriendo borrador" : "Abrir borrador de salida"}
    >
      <Pencil className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{loading ? "Abriendo…" : "Abrir"}</span>
    </Button>
  );
}
