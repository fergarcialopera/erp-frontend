import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Camera, CameraOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { normalizeBarcode } from "./normalizeBarcode";

type ScannerStatus = "starting" | "scanning" | "denied" | "unavailable" | "error";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
  title?: string;
  description?: string;
}

function buildReader(): BrowserMultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints);
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
  title = "Escanear código",
  description = "Apunta la cámara al código de barras o QR del producto.",
}: BarcodeScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onOpenChangeRef = useRef(onOpenChange);
  const [status, setStatus] = useState<ScannerStatus>("starting");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  onScanRef.current = onScan;
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) return;

    handledRef.current = false;
    setStatus("starting");
    setErrorDetail(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }

    const reader = buildReader();
    let cancelled = false;

    const start = async () => {
      const video = videoRef.current;
      if (!video) {
        setStatus("error");
        setErrorDetail("No se pudo preparar el visor de cámara.");
        return;
      }
      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          video,
          (result, _error, ctrl) => {
            controlsRef.current = ctrl;
            if (cancelled || handledRef.current || !result) return;
            const text = normalizeBarcode(result.getText());
            if (!text) return;
            handledRef.current = true;
            ctrl.stop();
            controlsRef.current = null;
            onScanRef.current(text);
            onOpenChangeRef.current(false);
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus("scanning");
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setStatus("unavailable");
        } else {
          setStatus("error");
          setErrorDetail(err instanceof Error ? err.message : "No se pudo iniciar la cámara.");
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      const stream = videoRef.current?.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg border bg-black aspect-[3/4] sm:aspect-video">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
            autoPlay
          />
          {status !== "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 px-4 text-center text-sm text-white">
              {status === "starting" && (
                <>
                  <Camera className="h-8 w-8 animate-pulse" aria-hidden />
                  <p>Activando cámara…</p>
                </>
              )}
              {status === "denied" && (
                <>
                  <CameraOff className="h-8 w-8" aria-hidden />
                  <p>Permiso de cámara denegado. Actívalo en el navegador e inténtalo de nuevo.</p>
                </>
              )}
              {status === "unavailable" && (
                <>
                  <CameraOff className="h-8 w-8" aria-hidden />
                  <p>No hay cámara disponible o este dispositivo no la permite en este contexto.</p>
                </>
              )}
              {status === "error" && (
                <>
                  <CameraOff className="h-8 w-8" aria-hidden />
                  <p>{errorDetail ?? "Error al usar la cámara."}</p>
                </>
              )}
            </div>
          )}
          {status === "scanning" && (
            <div
              className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-primary/80 shadow-[0_0_12px_hsl(var(--primary))]"
              aria-hidden
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Requiere HTTPS (o localhost). La cámara solo se usa mientras este diálogo está abierto.
        </p>

        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
