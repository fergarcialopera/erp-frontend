import type { PendingExitItem } from "@/features/dashboard/types";
import {
  cancelExitLog,
  createExitLog,
  getExitLog,
  updateExitLog,
  type CreateExitLogItem,
} from "./api";
import { mapExitLogDetailToPendingItems } from "./mapExitLogDetailToPendingItems";

function structureKey(
  lines: { productId: string; compartmentId?: string | null }[],
): string {
  return lines
    .map((line) => `${line.productId}:${line.compartmentId ?? ""}`)
    .sort()
    .join("|");
}

export function pendingItemsToCreateItems(items: PendingExitItem[]): CreateExitLogItem[] {
  return items
    .filter((item) => item.confirmedQuantity > 0)
    .map((item) => ({
      product_id: item.productId,
      quantity: item.confirmedQuantity,
      ...(item.compartmentId ? { compartment_id: item.compartmentId } : {}),
    }));
}

/** Alinea el borrador del servidor con el plan local antes de confirmar. */
export async function syncExitLogDraftBeforeConfirm(
  exitLogId: string,
  items: PendingExitItem[],
  note?: string | null,
): Promise<{ exitLogId: string }> {
  const detail = await getExitLog(exitLogId);
  const desired = items.filter((item) => item.confirmedQuantity > 0);
  const desiredCreate = pendingItemsToCreateItems(desired);

  const serverStructure = structureKey(
    detail.items.map((line) => ({
      productId: line.product?.id ?? "",
      compartmentId: line.compartment?.id,
    })),
  );
  const desiredStructure = structureKey(
    desiredCreate.map((line) => ({
      productId: line.product_id,
      compartmentId: line.compartment_id,
    })),
  );

  if (serverStructure !== desiredStructure) {
    await cancelExitLog(exitLogId);
    const created = await createExitLog({
      note: note?.trim() || undefined,
      items: desiredCreate,
    });
    return { exitLogId: created.exit_log.id };
  }

  const patches = detail.items.map((line) => {
    const match = desired.find(
      (item) =>
        item.productId === line.product?.id &&
        (item.compartmentId ?? undefined) === (line.compartment?.id ?? undefined),
    );
    return {
      item_id: line.id,
      quantity: match?.confirmedQuantity ?? 0,
    };
  });

  if (patches.length > 0) {
    await updateExitLog(exitLogId, { items: patches });
  }

  return { exitLogId };
}
