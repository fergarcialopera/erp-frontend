import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductSearchItem } from "../types";

interface ProductSearchResultsProps {
  results: ProductSearchItem[];
  isLoading: boolean;
  hasQuery: boolean;
  canExecute: boolean;
  onAdd: (item: ProductSearchItem) => void;
}

export function ProductSearchResults({
  results,
  isLoading,
  hasQuery,
  canExecute,
  onAdd,
}: ProductSearchResultsProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando productos...</p>;
  }
  if (!hasQuery) {
    return (
      <p className="text-sm text-muted-foreground">
        Escribe al menos <span className="font-medium">2 caracteres</span> para buscar en inventario.
      </p>
    );
  }
  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No hay resultados para esa búsqueda.</p>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((item) => (
        <div
          key={item.productId}
          className={cn(
            "border rounded-md p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
            item.availableStock <= 0 && "opacity-60",
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {item.sku}
              {item.barcode ? ` | Barcode: ${item.barcode}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Stock: <span className="font-medium tabular-nums">{item.availableStock}</span>
              {item.location ? ` | Ubicación: ${item.location}` : ""}
              {item.availableStock <= 0 ? " | Sin stock" : ""}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onAdd(item)}
            disabled={!canExecute}
            className="self-start sm:self-center"
          >
            Añadir
          </Button>
        </div>
      ))}
    </div>
  );
}
