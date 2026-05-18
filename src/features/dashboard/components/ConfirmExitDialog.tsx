import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuantityInput } from "./QuantityInput";
import type { PendingExitItem } from "../types";

interface ConfirmExitDialogProps {
  open: boolean;
  items: PendingExitItem[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSetQty: (productId: string, quantity: number) => void;
  onCancelDrafts: () => void;
  onConfirm: () => void;
}

export function ConfirmExitDialog({
  open,
  items,
  loading,
  onOpenChange,
  onSetQty,
  onCancelDrafts,
  onConfirm,
}: ConfirmExitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar salida</DialogTitle>
          <DialogDescription>
            Revisa y ajusta la cantidad real retirada antes de confirmar. Introduce 0 si finalmente no se ha retirado
            este producto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
          {items.map((item) => (
            <div
              key={item.productId}
              className="rounded-lg border bg-muted/15 p-3 flex items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  SKU: {item.sku} · Solicitada: {item.quantity}
                </p>
              </div>
              <QuantityInput
                value={item.confirmedQuantity}
                min={0}
                onChange={(qty) => onSetQty(item.productId, qty)}
                disabled={loading}
                aria-label={`Cantidad confirmada de ${item.name}`}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelDrafts} disabled={loading || items.length === 0}>
            Cancelar borradores
          </Button>
          <Button onClick={onConfirm} disabled={loading || items.length === 0}>
            {loading ? "Confirmando..." : "Confirmar salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
