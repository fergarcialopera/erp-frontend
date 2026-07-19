import type { ReactNode } from "react";
import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ListFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

type ListFiltersToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filtros siempre visibles (p. ej. estado). */
  primaryFilters?: ReactNode;
  /** Contenido del popover «Filtros». Si se omite, no se muestra el botón. */
  advancedFilters?: ReactNode;
  /** Número de filtros avanzados activos (badge del botón). */
  advancedActiveCount?: number;
  /** Chips de filtros activos (avanzados o primarios no por defecto). */
  chips?: ListFilterChip[];
  onClearAll?: () => void;
  className?: string;
};

export function ListFiltersToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  primaryFilters,
  advancedFilters,
  advancedActiveCount = 0,
  chips = [],
  onClearAll,
  className,
}: ListFiltersToolbarProps) {
  const showSearch = onSearchChange != null;
  const showAdvanced = advancedFilters != null;
  const hasChips = chips.length > 0;

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {showSearch ? (
          <div className="relative min-w-0 flex-1 basis-[min(100%,12rem)] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 bg-background pl-9"
            />
          </div>
        ) : null}

        {primaryFilters}

        {showAdvanced ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5">
                <ListFilter className="h-4 w-4" />
                Filtros
                {advancedActiveCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px] font-semibold"
                  >
                    {advancedActiveCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(100vw-2rem,22rem)] space-y-4 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Filtros</p>
                <p className="text-xs text-muted-foreground">
                  Afina el listado. Los filtros activos aparecen como chips debajo.
                </p>
              </div>
              <div className="space-y-3">{advancedFilters}</div>
              {onClearAll && advancedActiveCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-muted-foreground"
                  onClick={onClearAll}
                >
                  Limpiar filtros
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      {hasChips ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex h-7 max-w-full items-center gap-1 rounded-md border bg-muted/40 px-2 text-xs text-foreground transition-colors hover:bg-muted"
              aria-label={`Quitar filtro ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <X className="h-3 w-3 shrink-0 opacity-60" />
            </button>
          ))}
          {onClearAll ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={onClearAll}
            >
              Limpiar todo
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Campo etiquetado dentro del popover de filtros avanzados. */
export function ListFilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** Valor sentinela para selects opcionales de filtro. */
export const LIST_FILTER_NONE = "__none__";
