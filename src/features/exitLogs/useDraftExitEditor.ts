import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PendingExitItem } from "@/features/dashboard/types";
import { getExitLog } from "./api";
import { mapExitLogDetailToPendingItems } from "./mapExitLogDetailToPendingItems";
import {
  prefetchProductStockCache,
  totalZoneStock,
  type ProductStockCache,
} from "./productStockCache";
import { replanPendingProductLines } from "./replanPendingProductLines";
import { syncExitLogDraftBeforeConfirm } from "./syncExitLogDraft";
import { useCancelExitLog, useConfirmExitLog } from "./queries";

function productQuantitiesFromItems(items: PendingExitItem[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    totals[item.productId] = (totals[item.productId] ?? 0) + item.quantity;
  }
  return totals;
}

function enrichPendingItems(
  items: PendingExitItem[],
  cache: ProductStockCache,
): PendingExitItem[] {
  return items.map((item) => {
    const total = totalZoneStock(cache.get(item.productId) ?? []);
    return {
      ...item,
      availableStock: total > 0 ? total : item.availableStock,
    };
  });
}

export function useDraftExitEditor(clinicId: string | null, canExecute = true) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PendingExitItem[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string | undefined>>({});
  const [open, setOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const stockCacheRef = useRef<ProductStockCache>(new Map());

  const confirmExitMutation = useConfirmExitLog();
  const cancelExitMutation = useCancelExitLog();

  const isConfirming = confirmExitMutation.isPending || cancelExitMutation.isPending;

  const hasQuantityErrors = Object.values(quantityErrors).some(Boolean);

  const invalidateExitQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["exit-logs", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] }),
    ]);
  }, [clinicId, queryClient]);

  const ensureStockCache = useCallback(async (productIds: string[]) => {
    const missing = productIds.filter((id) => !stockCacheRef.current.has(id));
    if (missing.length === 0) return stockCacheRef.current;

    const fetched = await prefetchProductStockCache(missing);
    for (const [productId, zones] of fetched) {
      stockCacheRef.current.set(productId, zones);
    }
    return stockCacheRef.current;
  }, []);

  const openWithItems = useCallback(
    async (pending: PendingExitItem[], cache?: ProductStockCache) => {
      const productIds = [...new Set(pending.map((item) => item.productId))];
      if (cache) {
        for (const [productId, zones] of cache) {
          stockCacheRef.current.set(productId, zones);
        }
      }
      await ensureStockCache(productIds);

      const enriched = enrichPendingItems(pending, stockCacheRef.current);
      setItems(enriched);
      setProductQuantities(productQuantitiesFromItems(enriched));
      setQuantityErrors({});
      setOpen(true);
    },
    [ensureStockCache],
  );

  const openById = useCallback(
    async (exitLogId: string) => {
      if (!canExecute) return;
      setOpeningId(exitLogId);
      try {
        const detail = await getExitLog(exitLogId);
        if (detail.exit_log.status?.toUpperCase() !== "DRAFT") {
          toast.error("No se puede editar", {
            description: "Solo las salidas en borrador pueden abrirse para modificación.",
          });
          return;
        }
        const pending = mapExitLogDetailToPendingItems(detail);
        if (pending.length === 0) {
          toast.error("Borrador vacío", {
            description: "Esta salida no tiene productos asociados.",
          });
          return;
        }
        await openWithItems(pending);
      } catch {
        toast.error("No se pudo cargar el borrador");
      } finally {
        setOpeningId(null);
      }
    },
    [canExecute, openWithItems],
  );

  const setProductQuantity = useCallback((productId: string, quantity: number) => {
    const qty = Math.max(0, Math.floor(quantity));
    setProductQuantities((prev) => ({ ...prev, [productId]: qty }));

    const zones = stockCacheRef.current.get(productId) ?? [];
    const maxAvailable = totalZoneStock(zones);

    if (qty > maxAvailable) {
      setQuantityErrors((prev) => ({
        ...prev,
        [productId]: `No hay tantas unidades disponibles (máx. ${maxAvailable}).`,
      }));
      return;
    }

    setQuantityErrors((prev) => ({ ...prev, [productId]: undefined }));

    setItems((prev) => {
      const head = prev.find((item) => item.productId === productId);
      if (!head) return prev;
      return replanPendingProductLines(productId, qty, prev, zones);
    });
  }, []);

  const confirmDrafts = useCallback(async () => {
    if (!canExecute || items.length === 0 || hasQuantityErrors) return;
    const exitLogId = items[0]?.exitLogId;
    if (!exitLogId) return;

    const activeItems = items.filter((item) => item.confirmedQuantity > 0);
    if (activeItems.length === 0) {
      toast.error("Sin productos", { description: "Indica al menos una unidad a retirar." });
      return;
    }

    try {
      const detail = await getExitLog(exitLogId);
      const { exitLogId: syncedId } = await syncExitLogDraftBeforeConfirm(
        exitLogId,
        activeItems,
        detail.exit_log.note,
      );
      await confirmExitMutation.mutateAsync(syncedId);
    } catch {
      toast.error("No se pudo confirmar la salida", {
        description: "Revisa las cantidades e inténtalo de nuevo.",
      });
      return;
    }

    setItems([]);
    setProductQuantities({});
    setQuantityErrors({});
    stockCacheRef.current = new Map();
    setOpen(false);
    await invalidateExitQueries();
    toast.success("Salida confirmada", {
      description: "Las cantidades reales se han confirmado correctamente.",
    });
  }, [
    canExecute,
    items,
    hasQuantityErrors,
    confirmExitMutation,
    invalidateExitQueries,
  ]);

  const cancelPendingDrafts = useCallback(async () => {
    if (!canExecute || items.length === 0) return;
    const exitLogId = items[0]?.exitLogId;
    if (!exitLogId) return;

    try {
      await cancelExitMutation.mutateAsync(exitLogId);
    } catch {
      toast.error("No se pudo cancelar el borrador de salida");
      return;
    }

    setItems([]);
    setProductQuantities({});
    setQuantityErrors({});
    stockCacheRef.current = new Map();
    setOpen(false);
    await invalidateExitQueries();
    toast.success("Borrador cancelado");
  }, [canExecute, items, cancelExitMutation, invalidateExitQueries]);

  return {
    items,
    productQuantities,
    quantityErrors,
    hasQuantityErrors,
    open,
    setOpen,
    openingId,
    openById,
    openWithItems,
    setProductQuantity,
    confirmDrafts,
    cancelPendingDrafts,
    isConfirming,
  };
}
