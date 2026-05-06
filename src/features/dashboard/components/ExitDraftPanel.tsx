import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "./QuantityInput";
import type { ExitDraftItem } from "../types";

interface ExitDraftPanelProps {
  items: ExitDraftItem[];
  canExecute: boolean;
  isExecuting: boolean;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onExecute: () => void;
}

export function ExitDraftPanel({
  items,
  canExecute,
  isExecuting,
  onUpdateQty,
  onRemove,
  onClear,
  onExecute,
}: ExitDraftPanelProps) {
  return (
    <div className="bg-card border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Salida en curso</h3>
          <p className="text-sm text-muted-foreground">Orden temporal de retirada</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear} disabled={items.length === 0 || !canExecute}>
          Limpiar
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay productos añadidos.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="border rounded-md p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {item.sku}
                  {item.location ? ` | Ubicación: ${item.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuantityInput
                  value={item.quantity}
                  min={1}
                  onChange={(qty) => onUpdateQty(item.productId, qty)}
                  disabled={!canExecute}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.productId)}
                  disabled={!canExecute}
                  aria-label="Eliminar producto de la salida"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        className="w-full h-11"
        disabled={!canExecute || items.length === 0 || isExecuting}
        onClick={onExecute}
      >
        {isExecuting ? "Ejecutando salida..." : "Ejecutar salida"}
      </Button>
      {!canExecute ? (
        <p className="text-xs text-muted-foreground">
          Tu perfil es de solo lectura y no puede ejecutar salidas.
        </p>
      ) : null}
    </div>
  );
}
