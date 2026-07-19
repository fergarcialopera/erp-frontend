import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonTable } from "@/components/SkeletonTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TABLE_HEAD_CLASS } from "@/components/tableTypography";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  /** Oculta la columna en viewports &lt; sm (640px). */
  hideBelowSm?: boolean;
  /** Oculta la columna en viewports &lt; md (768px). */
  hideBelowMd?: boolean;
}

function columnVisibilityClass(col: Pick<Column<object>, "hideBelowSm" | "hideBelowMd">): string {
  if (col.hideBelowMd) return "hidden md:table-cell";
  if (col.hideBelowSm) return "hidden sm:table-cell";
  return "";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  /** Actualización en segundo plano: atenúa solo el cuerpo de la tabla. */
  isRefreshing?: boolean;
  /** Si true, se muestra mensaje de error (p. ej. API caída) con opción de reintentar */
  isError?: boolean;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchKey?: string;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  headerAction?: React.ReactNode;
  filters?: React.ReactNode;
  pageSize?: number;
  /** Oculta la paginación interna (p. ej. paginación servidor externa). */
  hidePagination?: boolean;
  /** Contenido bajo la tabla (p. ej. paginación servidor). */
  footer?: React.ReactNode;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends object>({
  data,
  columns,
  isLoading,
  isRefreshing = false,
  isError,
  onRetry,
  searchPlaceholder = "Buscar...",
  searchKey,
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyAction,
  headerAction,
  filters,
  pageSize: defaultPageSize = 10,
  hidePagination = false,
  footer,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const filtered = useMemo(() => {
    let result = data;

    if (search && searchKey) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        const val = item[searchKey];
        return val && String(val).toLowerCase().includes(q);
      });
    }

    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, searchKey, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  if (isLoading && data.length === 0) {
    return <SkeletonTable columns={columns.length} />;
  }

  if (isError) {
    return (
      <div className="table-container">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Error al cargar los datos.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-sm mb-4">
            Comprueba la conexión o que el backend esté disponible.
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {filters ? <div className="min-w-0 flex-1">{filters}</div> : null}
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
            {searchKey && (
              <div className="relative w-full min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder={searchPlaceholder}
                  className="h-9 bg-background pl-9"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className={`relative transition-opacity ${isRefreshing ? "opacity-50 pointer-events-none" : ""}`}
        aria-busy={isRefreshing}
      >
        {paged.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`${TABLE_HEAD_CLASS} ${columnVisibilityClass(col)} ${col.className || ""}`}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-0.5 sm:gap-1 hover:text-foreground transition-colors max-w-full text-left"
                      >
                        {col.header}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((item, idx) => {
                const rowIndex = page * pageSize + idx;
                const rowId = (item as { id?: string }).id;
                return (
                  <TableRow
                    key={rowId != null && rowId !== "" ? `${rowId}-${rowIndex}` : `row-${rowIndex}`}
                    className={onRowClick ? "cursor-pointer" : ""}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`${columnVisibilityClass(col)} ${col.className || ""}`}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {footer}

      {/* Pagination */}
      {!hidePagination && filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 border-t">
          <div className="text-xs text-muted-foreground shrink-0">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
