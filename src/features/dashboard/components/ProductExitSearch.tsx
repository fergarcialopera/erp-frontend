import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductSearchResults } from "./ProductSearchResults";
import { ExitDraftHoverSummary } from "./ExitDraftHoverSummary";
import type { ExitDraftItem, ProductSearchItem } from "../types";
import { cn } from "@/lib/utils";

interface ProductExitSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  results: ProductSearchItem[];
  isLoading: boolean;
  canExecute: boolean;
  onAdd: (item: ProductSearchItem) => void;
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
    draftItems,
    onUpdateDraftQty,
    onRemoveDraftItem,
    onExecuteDraft,
    isExecuting,
  } = props;
  const hasQuery = search.trim().length >= 2;
  const hasDraft = draftItems.length > 0;

  return (
    <div className="bg-card border rounded-lg p-5 h-[420px] flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold">Registrar salida de stock</h3>
        <p className="text-sm text-muted-foreground">
          Busca productos y prepara una retirada en pocos pasos.
        </p>
      </div>

      {/* Header dinámico: buscador ancho + resumen de salida en curso */}
      <div className={cn("flex gap-3", !hasQuery && "flex-1 items-center")}>
        <div className={cn("relative", hasDraft ? "w-3/4" : "w-full")}>
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar producto por nombre, SKU o código de barras..."
            className={cn("pl-10", hasQuery ? "h-10" : "h-12 text-base")}
          />
        </div>

        {hasDraft ? (
          <div className="w-1/4">
            <ExitDraftHoverSummary
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

      {/* Resultados: aparecen solo con >=2 caracteres; caja fija con scroll (≈3 items) */}
      {hasQuery ? (
        <div className="flex-1">
          <div className="h-[210px] overflow-y-auto pr-1">
            <ProductSearchResults
              results={results}
              isLoading={isLoading}
              hasQuery={hasQuery}
              canExecute={canExecute}
              onAdd={onAdd}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <ProductSearchResults
            results={[]}
            isLoading={isLoading}
            hasQuery={false}
            canExecute={canExecute}
            onAdd={onAdd}
          />
        </div>
      )}
    </div>
  );
}
