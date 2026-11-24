import { useState } from "react";
import { Camera, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductSearchResults } from "./ProductSearchResults";
import { ExitDraftPanel } from "./ExitDraftPanel";
import { BarcodeScannerDialog } from "@/features/scanning/BarcodeScannerDialog";
import type { ExitDraftItem, ProductSearchItem } from "../types";
import { cn } from "@/lib/utils";

interface ProductExitSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  results: ProductSearchItem[];
  isLoading: boolean;
  canExecute: boolean;
  onAdd: (item: ProductSearchItem) => void;
  onBarcodeScanned: (code: string) => void;
  draftItems: ExitDraftItem[];
  onUpdateDraftQty: (productId: string, quantity: number) => void;
  onRemoveDraftItem: (productId: string) => void;
  onExecuteDraft: () => void;
  isExecuting: boolean;
}

export function ProductExitSearch(props: ProductExitSearchProps) {
  const {
    search,
    onSearchChange,
    results,
    isLoading,
    canExecute,
    onAdd,
    onBarcodeScanned,
    draftItems,
    onUpdateDraftQty,
    onRemoveDraftItem,
    onExecuteDraft,
    isExecuting,
  } = props;
  const [scannerOpen, setScannerOpen] = useState(false);
  const hasQuery = search.trim().length >= 2;
  const hasSearchText = search.length > 0;
  const hasDraft = draftItems.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div
        className={cn(
          "bg-card border rounded-lg p-4 sm:p-5 min-h-[280px] max-h-[min(420px,70dvh)] lg:h-[420px] lg:max-h-[420px] flex flex-col gap-4 min-w-0",
          hasDraft ? "lg:col-span-3" : "lg:col-span-5",
        )}
      >
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Registrar salida de stock</h3>
          <p className="text-sm text-muted-foreground">
            Busca o escanea productos y prepara una retirada en pocos pasos.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="relative min-w-0 flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar producto por nombre, SKU o código de barras..."
              className="pl-10 pr-10 h-10 w-full"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                !hasSearchText && "invisible pointer-events-none",
              )}
              onClick={() => onSearchChange("")}
              disabled={!hasSearchText}
              aria-label="Borrar búsqueda"
              tabIndex={hasSearchText ? 0 : -1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setScannerOpen(true)}
            disabled={!canExecute}
            aria-label="Escanear código de barras"
            title="Escanear código"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <BarcodeScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={onBarcodeScanned}
          title="Escanear producto"
          description="El código se usará para buscar y añadir el producto a la salida."
        />

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <ProductSearchResults
            results={results}
            isLoading={isLoading}
            hasQuery={hasQuery}
            canExecute={canExecute}
            onAdd={onAdd}
          />
        </div>
      </div>

      {hasDraft ? (
        <div className="lg:col-span-2 min-w-0">
          <ExitDraftPanel
            items={draftItems}
            canExecute={canExecute}
            onUpdateQty={onUpdateDraftQty}
            onRemove={onRemoveDraftItem}
            onExecute={onExecuteDraft}
            isExecuting={isExecuting}
          />
        </div>
      ) : null}
    </div>
  );
}
