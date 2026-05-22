import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockLocationDisplay } from "@/components/StockLocationDisplay";
import { QuantityInput } from "./QuantityInput";
import type { PendingExitItem } from "../types";
import { cn } from "@/lib/utils";

interface ConfirmExitDialogProps {
  open: boolean;
  items: PendingExitItem[];
  productQuantities: Record<string, number>;
  quantityErrors: Record<string, string | undefined>;
  hasQuantityErrors: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSetProductQty: (productId: string, quantity: number) => void;
  onCancelDrafts: () => void;
  onConfirm: () => void;
}

function groupItemsByProduct(items: PendingExitItem[]) {
  const map = new Map<string, PendingExitItem[]>();
  for (const item of items) {
    const list = map.get(item.productId) ?? [];
    list.push(item);
    map.set(item.productId, list);
  }
  return [...map.entries()];
}

export function ConfirmExitDialog({
  open,
  items,
  productQuantities,
  quantityErrors,
  hasQuantityErrors,
  loading,
  onOpenChange,
  onSetProductQty,
  onCancelDrafts,
  onConfirm,
}: ConfirmExitDialogProps) {
  const groups = useMemo(() => groupItemsByProduct(items), [items]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar salida</DialogTitle>
          <DialogDescription>
            Ajusta la cantidad a retirar; el sistema recalcula al instante los compartimentos
            para usar el mínimo número de ubicaciones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
          {groups.map(([productId, lines]) => {
            const head = lines[0];
            const qty = productQuantities[productId] ?? lines.reduce((s, l) => s + l.quantity, 0);
            const error = quantityErrors[productId];
            const hasPlan = lines.length > 0 && !error;

            return (
              <div key={productId} className="rounded-lg border bg-muted/10 p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{head.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      SKU: {head.sku} · Disponible:{" "}
                      <span className="tabular-nums font-medium text-foreground">
                        {head.availableStock}
                      </span>
                    </p>
                  </div>
                  <QuantityInput
                    value={qty}
                    min={0}
                    onChange={(value) => onSetProductQty(productId, value)}
                    disabled={loading}
                    aria-label={`Cantidad a retirar de ${head.name}`}
                  />
                </div>

                {error ? (
                  <p className="text-xs text-destructive font-medium" role="alert">
                    {error}
                  </p>
                ) : null}

                {hasPlan ? (
                  <div className="space-y-1.5 rounded-md border bg-muted/15 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Retirar de {lines.length === 1 ? "1 ubicación" : `${lines.length} ubicaciones`}:
                    </p>
                    <ul className="space-y-1">
                      {lines.map((item) => (
                        <li
                          key={item.exitLogItemId}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <StockLocationDisplay
                            {...(item.pickLocation ?? {})}
                            emptyLabel="Stock general"
                            className="min-w-0"
                          />
                          <span className="shrink-0 tabular-nums font-medium">
                            {item.quantity} uds
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : qty > 0 && !error ? (
                  <p className="text-xs text-muted-foreground">
                    No hay stock ubicado para planificar esta cantidad.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelDrafts} disabled={loading || items.length === 0}>
            Cancelar borradores
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || items.length === 0 || hasQuantityErrors}
            className={cn(hasQuantityErrors && "pointer-events-none")}
          >
            {loading ? "Confirmando..." : "Confirmar salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
