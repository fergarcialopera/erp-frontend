import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "./QuantityInput";
import type { ExitDraftItem } from "../types";

interface ExitDraftHoverSummaryProps {
  items: ExitDraftItem[];
  canExecute: boolean;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export function ExitDraftHoverSummary({
  items,
  canExecute,
  onUpdateQty,
  onRemove,
  onExecute,
  isExecuting,
}: ExitDraftHoverSummaryProps) {
  const totalUnits = items.reduce((acc, it) => acc + (Number.isFinite(it.quantity) ? it.quantity : 0), 0);

  return (
    <HoverCard openDelay={100} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="w-full rounded-md border bg-muted/20 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
          aria-label="Ver salida en curso"
        >
          <p className="text-xs text-muted-foreground">Salida en curso</p>
          <p className="text-sm font-medium tabular-nums">
            {items.length} productos · {totalUnits} uds
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {items.slice(0, 2).map((it) => it.name).join(", ")}
            {items.length > 2 ? "…" : ""}
          </p>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-[420px] p-4" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Salida en curso</p>
              <p className="text-xs text-muted-foreground">Ajusta cantidades o elimina productos</p>
            </div>
            <Button
              size="sm"
              onClick={onExecute}
              disabled={!canExecute || items.length === 0 || isExecuting}
            >
              {isExecuting ? "Ejecutando..." : "Ejecutar salida"}
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {items.map((it) => (
              <div key={it.productId} className="border rounded-md p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground truncate">SKU: {it.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <QuantityInput
                    value={it.quantity}
                    min={1}
                    onChange={(qty) => onUpdateQty(it.productId, qty)}
                    disabled={!canExecute}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(it.productId)}
                    disabled={!canExecute}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

