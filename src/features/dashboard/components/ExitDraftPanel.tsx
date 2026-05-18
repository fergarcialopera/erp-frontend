import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "./QuantityInput";
import type { ExitDraftItem } from "../types";
import { cn } from "@/lib/utils";

interface ExitDraftPanelProps {
  items: ExitDraftItem[];
  canExecute: boolean;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

function stockMax(item: ExitDraftItem): number | undefined {
  return item.availableStock > 0 ? item.availableStock : undefined;
}

export function ExitDraftPanel({
  items,
  canExecute,
  onUpdateQty,
  onRemove,
  onExecute,
  isExecuting,
}: ExitDraftPanelProps) {
  const totalUnits = items.reduce((acc, it) => acc + (Number.isFinite(it.quantity) ? it.quantity : 0), 0);

  return (
    <div className="bg-card border rounded-lg p-5 h-[420px] flex flex-col gap-4 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">Salida en curso</h3>
          <p className="text-sm text-muted-foreground">
            {items.length > 0
              ? `${items.length} productos · ${totalUnits} uds`
              : "Añade productos desde el buscador"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onExecute}
          disabled={!canExecute || items.length === 0 || isExecuting}
          className="shrink-0"
        >
          {isExecuting ? "Ejecutando..." : "Ejecutar salida"}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-sm text-muted-foreground">
            Los productos que añadas aparecerán aquí para ajustar cantidades antes de registrar la
            salida.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-0">
          {items.map((it) => {
            const maxQty = stockMax(it);
            const overStock = maxQty !== undefined && it.quantity > maxQty;

            return (
              <div
                key={it.productId}
                className="rounded-lg border bg-muted/15 p-3 flex items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{it.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">SKU: {it.sku}</p>
                  <p
                    className={cn(
                      "text-xs mt-1 tabular-nums",
                      overStock ? "text-destructive font-medium" : "text-muted-foreground",
                    )}
                  >
                    {it.availableStock > 0
                      ? `Disponible: ${it.availableStock}`
                      : "Sin stock en inventario"}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <QuantityInput
                    value={it.quantity}
                    min={1}
                    max={maxQty}
                    onChange={(qty) => onUpdateQty(it.productId, qty)}
                    disabled={!canExecute}
                    aria-label={`Cantidad de ${it.name}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(it.productId)}
                    disabled={!canExecute}
                    aria-label={`Quitar ${it.name} de la salida`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
