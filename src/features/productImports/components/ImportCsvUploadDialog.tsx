import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

interface ImportCsvUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function ImportCsvUploadDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
}: ImportCsvUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setError(null);
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    if (isUploading) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const validateAndSet = (candidate: File | null | undefined) => {
    if (!candidate) return;
    setError(null);
    const name = candidate.name.toLowerCase();
    if (!name.endsWith(".csv")) {
      setError("Solo se admiten archivos .csv");
      setFile(null);
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError("El archivo supera el máximo permitido de 5 MB");
      setFile(null);
      return;
    }
    setFile(candidate);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Selecciona un archivo CSV");
      return;
    }
    await onUpload(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg" className="overflow-x-hidden">
        <DialogHeader className="min-w-0">
          <DialogTitle>Nueva importación CSV</DialogTitle>
          <DialogDescription>
            Exportación de productos de Odoo delimitada por punto y coma (;). Máximo 5 MB.
            Decimales en formato español (10,49).
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "relative flex min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20",
            isUploading && "opacity-60 pointer-events-none",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            validateAndSet(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Arrastra el CSV aquí o selecciona un archivo</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            Elegir archivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
        </div>

        {file && (
          <div className="flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate" title={file.name}>
              {file.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={isUploading}
              onClick={reset}
              aria-label="Quitar archivo"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={!file || isUploading}>
            {isUploading ? "Analizando…" : "Subir y analizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
