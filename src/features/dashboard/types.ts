import type { StockLocationLabels } from "@/lib/stockLocation";

export interface ProductSearchItem {
  productId: string;
  sku: string;
  name: string;
  barcode?: string;
  availableStock: number;
  locations: StockLocationLabels[];
}

export interface ExitDraftItem extends ProductSearchItem {
  quantity: number;
}

export interface PendingExitItem extends ExitDraftItem {
  exitLogId: string;
  /** Id de línea en exit_log_items (PATCH /exit-logs/{id}). */
  exitLogItemId: string;
  confirmedQuantity: number;
}
