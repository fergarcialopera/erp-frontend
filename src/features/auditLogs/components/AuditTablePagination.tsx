import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditPaginationMeta } from "@/types/audit";

interface AuditTablePaginationProps {
  meta: AuditPaginationMeta;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  isRefreshing?: boolean;
}

export function AuditTablePagination({
  meta,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  isRefreshing = false,
}: AuditTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(meta.total / pageSize));
  const currentPage = meta.page;

  if (meta.total === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 border-t">
      <div className="text-xs text-muted-foreground shrink-0">
        {meta.total} registro{meta.total !== 1 ? "s" : ""}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={String(pageSize)}
          disabled={isRefreshing}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
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
            disabled={isRefreshing || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isRefreshing || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
