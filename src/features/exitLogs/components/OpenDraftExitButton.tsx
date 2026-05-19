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
      className="h-8"
      disabled={disabled || loading}
      onClick={() => onOpen(exitLogId)}
    >
      <Pencil className="h-3.5 w-3.5" />
      {loading ? "Abriendo…" : "Abrir"}
    </Button>
  );
}
