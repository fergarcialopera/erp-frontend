import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PendingExitItem } from "@/features/dashboard/types";
import { getExitLog } from "./api";
import { mapExitLogDetailToPendingItems } from "./mapExitLogDetailToPendingItems";
import {
  useCancelExitLog,
  useConfirmExitLog,
  useUpdateExitLog,
} from "./queries";

export function useDraftExitEditor(clinicId: string | null, canExecute = true) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PendingExitItem[]>([]);
  const [open, setOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const updateExitMutation = useUpdateExitLog();
  const confirmExitMutation = useConfirmExitLog();
  const cancelExitMutation = useCancelExitLog();

  const isConfirming =
    updateExitMutation.isPending || confirmExitMutation.isPending || cancelExitMutation.isPending;

  const invalidateExitQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["exit-logs", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] }),
    ]);
  }, [clinicId, queryClient]);

  const openWithItems = useCallback((pending: PendingExitItem[]) => {
    setItems(pending);
    setOpen(true);
  }, []);

  const openById = useCallback(async (exitLogId: string) => {
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
        toast.error("Borrador vacío", { description: "Esta salida no tiene productos asociados." });
        return;
      }
      openWithItems(pending);
    } catch {
      toast.error("No se pudo cargar el borrador");
    } finally {
      setOpeningId(null);
    }
  }, [canExecute, openWithItems]);

  const setItemQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, confirmedQuantity: Math.max(0, quantity) } : item,
      ),
    );
  }, []);

  const confirmDrafts = useCallback(async () => {
    if (!canExecute || items.length === 0) return;
    const exitLogId = items[0]?.exitLogId;
    if (!exitLogId) return;

    const patchItems = items
      .filter((item) => item.confirmedQuantity !== item.quantity)
      .map((item) => ({
        item_id: item.exitLogItemId,
        quantity: item.confirmedQuantity,
      }));

    try {
      if (patchItems.length > 0) {
        await updateExitMutation.mutateAsync({
          id: exitLogId,
          payload: { items: patchItems },
        });
      }
      await confirmExitMutation.mutateAsync(exitLogId);
    } catch {
      toast.error("No se pudo confirmar la salida", {
        description: "Revisa las cantidades e inténtalo de nuevo.",
      });
      return;
    }

    setItems([]);
    setOpen(false);
    await invalidateExitQueries();
    toast.success("Salida confirmada", {
      description: "Las cantidades reales se han confirmado correctamente.",
    });
  }, [canExecute, items, updateExitMutation, confirmExitMutation, invalidateExitQueries]);

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
    setOpen(false);
    await invalidateExitQueries();
    toast.success("Borrador cancelado");
  }, [canExecute, items, cancelExitMutation, invalidateExitQueries]);

  return {
    items,
    open,
    setOpen,
    openingId,
    openById,
    openWithItems,
    setItemQty,
    confirmDrafts,
    cancelPendingDrafts,
    isConfirming,
  };
}
